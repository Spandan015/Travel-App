const Message         = require('../models/Message');
const GuideBooking    = require('../models/GuideBooking');
const PackageBooking  = require('../models/PackageBooking');
const TrekBooking     = require('../models/TrekBooking');
const Notification    = require('../models/Notification');

// ── Helper: find booking from any type and verify access ─────────────────────
async function resolveBooking(bookingId, userId) {
  // Try GuideBooking first (direct guide booking)
  let booking = await GuideBooking.findById(bookingId);
  let bookingType = 'guide';

  if (!booking) {
    booking = await PackageBooking.findById(bookingId);
    bookingType = 'package';
  }
  if (!booking) {
    booking = await TrekBooking.findById(bookingId);
    bookingType = 'trek';
  }
  if (!booking) throw { status: 404, message: 'Booking not found' };

  // For GuideBooking: chat requires accepted status
  if (bookingType === 'guide') {
    if (!['accepted', 'completed'].includes(booking.status)) {
      throw { status: 403, message: 'Chat is only available for accepted bookings' };
    }
    const isUser  = booking.user.toString()  === userId.toString();
    const isGuide = booking.guide.toString() === userId.toString();
    if (!isUser && !isGuide) throw { status: 403, message: 'Access denied' };

    return { booking, bookingType, userId1: booking.user, userId2: booking.guide };
  }

  // For PackageBooking / TrekBooking: chat requires assignedGuide
  if (!booking.assignedGuide) {
    throw { status: 403, message: 'No guide assigned to this booking yet' };
  }
  if (!['pending','confirmed','completed'].includes(booking.status)) {
    throw { status: 403, message: 'Booking is not active' };
  }

  const isUser  = booking.user.toString()         === userId.toString();
  const isGuide = booking.assignedGuide.toString() === userId.toString();
  if (!isUser && !isGuide) throw { status: 403, message: 'Access denied' };

  return { booking, bookingType, userId1: booking.user, userId2: booking.assignedGuide };
}

// GET /api/chat/booking/:bookingId
exports.getMessages = async (req, res) => {
  try {
    const { booking } = await resolveBooking(req.params.bookingId, req.user.id);

    const messages = await Message.find({ booking: booking._id })
      .populate('sender',   'firstName lastName username profileImage')
      .populate('receiver', 'firstName lastName username profileImage')
      .sort({ createdAt: 1 });

    // Mark messages sent to me as read
    await Message.updateMany(
      { booking: booking._id, receiver: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

// POST /api/chat/booking/:bookingId
exports.sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    if (!text && !image) return res.status(400).json({ message: 'Message text is required' });

    const { booking, userId1, userId2 } = await resolveBooking(req.params.bookingId, req.user.id);

    // Receiver is the other party
    const receiverId = userId1.toString() === req.user.id.toString() ? userId2 : userId1;

    const message = await Message.create({
      booking:  booking._id,
      sender:   req.user.id,
      receiver: receiverId,
      text:     text?.trim(),
      image,
    });

    const populated = await Message.findById(message._id)
      .populate('sender',   'firstName lastName username profileImage')
      .populate('receiver', 'firstName lastName username profileImage');

    // Notify receiver
    try {
      await Notification.create({
        user:       receiverId,
        type:       'new_message',
        title:      'New message',
        body:       `${req.user.firstName || req.user.username || 'Someone'} sent you a message`,
        link:       `/my-chats/${booking._id}`,
        refBooking: booking._id,
        refMessage: message._id,
      });
    } catch (_) {}

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

// GET /api/chat/my-chats
// Returns all chats across GuideBookings + PackageBookings + TrekBookings
exports.getMyChats = async (req, res) => {
  try {
    const uid = req.user.id;

    // 1. Direct guide bookings (user ↔ guide)
    const guideBookings = await GuideBooking.find({
      $or: [{ user: uid }, { guide: uid }],
      status: { $in: ['accepted', 'completed'] },
    })
      .populate('user',        'firstName lastName username profileImage')
      .populate('guide',       'firstName lastName username profileImage guideProfile')
      .populate('destination', 'name')
      .sort({ updatedAt: -1 });

    // 2. Package bookings where user is tourist or assigned guide
    const packageBookings = await PackageBooking.find({
      $or: [{ user: uid }, { assignedGuide: uid }],
      assignedGuide: { $ne: null },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    })
      .populate('user',          'firstName lastName username profileImage')
      .populate('assignedGuide', 'firstName lastName username profileImage guideProfile')
      .populate('package',       'name mainImage duration')
      .sort({ updatedAt: -1 });

    // 3. Trek bookings where user is tourist or assigned guide
    const trekBookings = await TrekBooking.find({
      $or: [{ user: uid }, { assignedGuide: uid }],
      assignedGuide: { $ne: null },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    })
      .populate('user',          'firstName lastName username profileImage')
      .populate('assignedGuide', 'firstName lastName username profileImage guideProfile')
      .populate('trek',          'name coverImage duration')
      .sort({ updatedAt: -1 });

    // ── Build unified chat list ──────────────────────────────────────────────
    const allBookings = [
      ...guideBookings.map(b  => ({ booking: b,  type: 'guide'   })),
      ...packageBookings.map(b => ({ booking: b, type: 'package' })),
      ...trekBookings.map(b   => ({ booking: b,  type: 'trek'    })),
    ];

    const chats = await Promise.all(
      allBookings.map(async ({ booking, type }) => {
        const lastMsg = await Message.findOne({ booking: booking._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'firstName lastName username');

        const unread = await Message.countDocuments({
          booking:  booking._id,
          receiver: uid,
          isRead:   false,
        });

        // Determine the other party
        let otherParty, itemName, itemImage;
        if (type === 'guide') {
          otherParty = booking.guide?._id?.toString() === uid.toString()
            ? booking.user : booking.guide;
          itemName  = booking.destination?.name || 'Guide Booking';
          itemImage = null;
        } else if (type === 'package') {
          otherParty = booking.assignedGuide?._id?.toString() === uid.toString()
            ? booking.user : booking.assignedGuide;
          itemName  = booking.package?.name || 'Package Booking';
          itemImage = booking.package?.mainImage || null;
        } else {
          otherParty = booking.assignedGuide?._id?.toString() === uid.toString()
            ? booking.user : booking.assignedGuide;
          itemName  = booking.trek?.name || 'Trek Booking';
          itemImage = booking.trek?.coverImage || null;
        }

        return {
          booking,
          type,
          otherParty,
          itemName,
          itemImage,
          lastMessage: lastMsg,
          unreadCount: unread,
        };
      })
    );

    // Sort by last message date
    chats.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt || a.booking.createdAt;
      const dateB = b.lastMessage?.createdAt || b.booking.createdAt;
      return new Date(dateB) - new Date(dateA);
    });

    res.json({ success: true, chats });
  } catch (err) {
    console.error('getMyChats error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead:   false,
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};