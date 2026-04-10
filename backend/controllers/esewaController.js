const crypto = require('crypto');
const HotelBooking   = require('../models/HotelBooking');
const PackageBooking = require('../models/PackageBooking');
const TrekBooking    = require('../models/TrekBooking');

// ── eSewa Sandbox Config ─────────────────────────────────────────────────────
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY   = process.env.ESEWA_SECRET_KEY   || '8gBm/:&EnhH.1/q';
const ESEWA_GATEWAY_URL  = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const FRONTEND_URL       = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── HMAC-SHA256 Signature ────────────────────────────────────────────────────
const generateSignature = (totalAmount, transactionUuid) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  return crypto.createHmac('sha256', ESEWA_SECRET_KEY).update(message).digest('base64');
};

const verifySignature = (data) => {
  const message = `transaction_code=${data.transaction_code},status=${data.status},total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${ESEWA_PRODUCT_CODE},signed_field_names=${data.signed_field_names}`;
  const expected = crypto.createHmac('sha256', ESEWA_SECRET_KEY).update(message).digest('base64');
  return expected === data.signature;
};

// ── Get booking model by type ─────────────────────────────────────────────────
const getBookingModel = (type) => {
  switch (type) {
    case 'hotel':   return HotelBooking;
    case 'package': return PackageBooking;
    case 'trek':    return TrekBooking;
    default:        return null;
  }
};

// ── Populate booking based on type ───────────────────────────────────────────
const populateBooking = async (booking, type) => {
  try {
    const popMap = {
      hotel:   [{ path: 'hotel',   select: 'name location images pricePerNight' }, { path: 'user', select: 'username email' }],
      package: [{ path: 'package', select: 'name price duration mainImage'      }, { path: 'user', select: 'username email' }],
      trek:    [{ path: 'trek',    select: 'name price duration coverImage'      }, { path: 'user', select: 'username email' }],
    };
    await booking.populate(popMap[type] || []);
  } catch (_) {}
};

// ── POST /api/esewa/initiate ──────────────────────────────────────────────────
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, bookingType } = req.body;
    if (!bookingId || !bookingType)
      return res.status(400).json({ message: 'bookingId and bookingType are required' });

    const Model = getBookingModel(bookingType);
    if (!Model) return res.status(400).json({ message: 'Invalid booking type' });

    const booking = await Model.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied' });

    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ message: 'This booking is already paid' });

    const transactionUuid = `${bookingType}-${bookingId}-${Date.now()}`;
    const totalAmount     = booking.totalPrice;
    const signature       = generateSignature(totalAmount, transactionUuid);

    booking.transactionUuid = transactionUuid;
    booking.paymentStatus   = 'pending';
    await booking.save();

    const formData = {
      amount:                   totalAmount,
      tax_amount:               0,
      total_amount:             totalAmount,
      transaction_uuid:         transactionUuid,
      product_code:             ESEWA_PRODUCT_CODE,
      product_service_charge:   0,
      product_delivery_charge:  0,
      success_url:              `${FRONTEND_URL}/payment/success`,
      failure_url:              `${FRONTEND_URL}/payment/failure`,
      signed_field_names:       'total_amount,transaction_uuid,product_code',
      signature,
    };

    res.json({ success: true, url: ESEWA_GATEWAY_URL, formData });
  } catch (err) {
    console.error('eSewa initiate error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/esewa/verify ────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { data, bookingType } = req.body;
    if (!data) return res.status(400).json({ message: 'No payment data received' });

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    } catch {
      return res.status(400).json({ message: 'Invalid payment data format' });
    }

    console.log('eSewa decoded response:', decoded);

    if (!verifySignature(decoded))
      return res.status(400).json({ message: 'Payment signature verification failed' });

    if (decoded.status !== 'COMPLETE')
      return res.status(400).json({ message: `Payment not complete. Status: ${decoded.status}` });

    // Extract type and bookingId from transaction_uuid
    // Format: "hotel-<24charObjectId>-<timestamp>"
    const parts     = decoded.transaction_uuid.split('-');
    const type      = parts[0];                    // "hotel" | "package" | "trek"
    const bookingId = parts[1];                    // 24-char ObjectId

    const Model = getBookingModel(type || bookingType);
    if (!Model) return res.status(400).json({ message: 'Invalid booking type in transaction' });

    const booking = await Model.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Already paid — return current state
    if (booking.paymentStatus === 'paid') {
      await populateBooking(booking, type);
      return res.json({
        success: true,
        message: 'Booking already confirmed',
        booking,
        transaction: { code: booking.esewaRefId, uuid: decoded.transaction_uuid, amount: decoded.total_amount, status: decoded.status },
      });
    }

    if (!decoded.transaction_uuid.includes(bookingId))
      return res.status(400).json({ message: 'Transaction does not belong to this booking' });

    // Mark as paid
    booking.paymentStatus   = 'paid';
    booking.paymentMethod   = 'esewa';
    booking.status          = 'confirmed';
    booking.esewaRefId      = decoded.transaction_code;
    booking.transactionUuid = decoded.transaction_uuid;
    booking.paidAt          = new Date();
    await booking.save();

    await populateBooking(booking, type);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking,
      transaction: { code: decoded.transaction_code, uuid: decoded.transaction_uuid, amount: decoded.total_amount, status: decoded.status },
    });
  } catch (err) {
    console.error('eSewa verify error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/esewa/status/:bookingType/:bookingId ─────────────────────────────
exports.getPaymentStatus = async (req, res) => {
  try {
    const { bookingType, bookingId } = req.params;
    const Model = getBookingModel(bookingType);
    if (!Model) return res.status(400).json({ message: 'Invalid booking type' });

    const booking = await Model.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });

    res.json({
      success: true,
      paymentStatus:  booking.paymentStatus,
      bookingStatus:  booking.status,
      esewaRefId:     booking.esewaRefId,
      paidAt:         booking.paidAt,
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};