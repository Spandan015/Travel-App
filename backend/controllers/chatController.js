const Message      = require('../models/Message');
const GuideBooking = require('../models/GuideBooking');
const Notification = require('../models/Notification');

// Helper: verify the requester belongs to this booking
async function assertAccess(bookingId, userId) {
  const booking = await GuideBooking.findById(bookingId);
  if (!booking) throw { status: 404, message: 'Booking not found' };
  if (booking.status !== 'accepted' && booking.status !== 'completed') {
    throw { status: 403, message: 'Chat is only available for accepted bookings' };
  }
  const isUser  = booking.user.toString()  === userId.toString();
  const isGuide = booking.guide.toString() === userId.toString();
  if (!isUser && !isGuide) throw { status: 403, message: 'Access denied' };
  return booking;
}

// GET /api/chat/booking/:bookingId
// Returns all messages for a booking (guide or tourist only)
exports.getMessages = async (req, res) => {
  try {
    const booking = await assertAccess(req.params.bookingId, req.user.id);

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
// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    if (!text && !image) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const booking = await assertAccess(req.params.bookingId, req.user.id);

    // Determine receiver (the other party)
    const receiverId =
      booking.user.toString() === req.user.id.toString()
        ? booking.guide
        : booking.user;

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

    // Create notification for receiver
    await Notification.create({
      user:       receiverId,
      type:       'new_message',
      title:      'New message',
      body:       `${req.user.firstName || 'Someone'} sent you a message`,
      link:       `/guide/chat/${booking._id}`,
      refBooking: booking._id,
      refMessage: message._id,
    });

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

// GET /api/chat/my-chats
// Returns list of bookings that have active chats for the current user
exports.getMyChats = async (req, res) => {
  try {
    // Find all accepted/completed bookings involving this user
    const bookings = await GuideBooking.find({
      $or: [{ user: req.user.id }, { guide: req.user.id }],
      status: { $in: ['accepted', 'completed'] },
    })
      .populate('user',        'firstName lastName username profileImage')
      .populate('guide',       'firstName lastName username profileImage')
      .populate('destination', 'name')
      .sort({ updatedAt: -1 });

    // For each booking, get last message and unread count
    const chats = await Promise.all(
      bookings.map(async (b) => {
        const lastMsg = await Message.findOne({ booking: b._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'firstName lastName username');

        const unread = await Message.countDocuments({
          booking:  b._id,
          receiver: req.user.id,
          isRead:   false,
        });

        return {
          booking: b,
          lastMessage: lastMsg,
          unreadCount: unread,
        };
      })
    );

    res.json({ success: true, chats });
  } catch (err) {
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
