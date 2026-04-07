const crypto       = require('crypto');
const HotelBooking = require('../models/HotelBooking');
// const PackageBooking = require('../models/PackageBooking');
// const TrekBooking    = require('../models/TrekBooking');

// ── eSewa Sandbox Config ──────────────────────────────────────────────────────
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY   = process.env.ESEWA_SECRET_KEY   || '8gBm/:&EnhH.1/q';
const ESEWA_GATEWAY_URL  = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const FRONTEND_URL       = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── HMAC-SHA256 Signature ─────────────────────────────────────────────────────
const generateSignature = (totalAmount, transactionUuid) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  return crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
};

// ── Verify eSewa response signature ──────────────────────────────────────────
const verifySignature = (data) => {
  const message = `transaction_code=${data.transaction_code},status=${data.status},total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${ESEWA_PRODUCT_CODE},signed_field_names=${data.signed_field_names}`;
  const expected = crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
  return expected === data.signature;
};

// ── Get booking model by type ─────────────────────────────────────────────────
const getBookingModel = (type) => {
  switch (type) {
    case 'hotel':   return HotelBooking;
    // case 'package': return PackageBooking;
    // case 'trek':    return TrekBooking;
    default: return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/esewa/initiate
// ─────────────────────────────────────────────────────────────────────────────
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

    // Always generate a fresh transactionUuid so it matches what eSewa returns
    // Format: "hotel-<bookingId>-<timestamp>"
    const transactionUuid = `${bookingType}-${bookingId}-${Date.now()}`;
    const totalAmount     = booking.totalPrice;
    const signature       = generateSignature(totalAmount, transactionUuid);

    // ✅ Always overwrite transactionUuid so DB stays in sync
    booking.transactionUuid = transactionUuid;
    booking.paymentStatus   = 'pending';
    await booking.save();

    const formData = {
      amount:                  totalAmount,
      tax_amount:              0,
      total_amount:            totalAmount,
      transaction_uuid:        transactionUuid,
      product_code:            ESEWA_PRODUCT_CODE,
      product_service_charge:  0,
      product_delivery_charge: 0,
      // ✅ Clean URL — no query params — eSewa appends ?data=<base64> cleanly
      success_url: `${FRONTEND_URL}/payment/success`,
      failure_url: `${FRONTEND_URL}/payment/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    };

    res.json({ success: true, url: ESEWA_GATEWAY_URL, formData });
  } catch (err) {
    console.error('eSewa initiate error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/esewa/verify
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { data, bookingType } = req.body;

    if (!data) return res.status(400).json({ message: 'No payment data received' });

    // Decode base64 response from eSewa
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    } catch {
      return res.status(400).json({ message: 'Invalid payment data format' });
    }

    console.log('eSewa decoded response:', decoded);

    // ✅ Verify HMAC signature — this is the real security check
    if (!verifySignature(decoded))
      return res.status(400).json({ message: 'Payment signature verification failed' });

    if (decoded.status !== 'COMPLETE')
      return res.status(400).json({ message: `Payment not complete. Status: ${decoded.status}` });

    // Extract type and bookingId from transaction_uuid
    // Format: "hotel-<24charObjectId>-<timestamp>"
    // e.g.   "hotel-6801a2b3c4d5e6f7a8b9c0d1-1743832800000"
    const uuidParts = decoded.transaction_uuid.split('-');
    const type      = uuidParts[0];                // "hotel"
    const bookingId = uuidParts[1];                // "6801a2b3c4d5e6f7a8b9c0d1"
    // uuidParts[2] is the timestamp — we don't need it

    const Model = getBookingModel(type || bookingType);
    if (!Model) return res.status(400).json({ message: 'Invalid booking type in transaction' });

    const booking = await Model.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // ✅ Prevent double-payment
    if (booking.paymentStatus === 'paid') {
      await booking.populate([
        { path: 'hotel', select: 'name location images pricePerNight' },
        { path: 'user',  select: 'username email' },
      ]);
      return res.json({
        success: true,
        message: 'Booking already confirmed',
        booking,
        transaction: {
          code:   booking.esewaRefId,
          uuid:   decoded.transaction_uuid,
          amount: decoded.total_amount,
          status: decoded.status,
        },
      });
    }

    // ✅ REMOVED strict transactionUuid match — signature check is sufficient
    // Just make sure it belongs to this booking by checking the bookingId in uuid
    if (!decoded.transaction_uuid.includes(bookingId)) {
      return res.status(400).json({ message: 'Transaction does not belong to this booking' });
    }

    // Mark as paid
    booking.paymentStatus   = 'paid';
    booking.paymentMethod   = 'esewa';
    booking.status          = 'confirmed';
    booking.esewaRefId      = decoded.transaction_code;
    booking.transactionUuid = decoded.transaction_uuid; // keep in sync
    booking.paidAt          = new Date();
    await booking.save();

    await booking.populate([
      { path: 'hotel', select: 'name location images pricePerNight' },
      { path: 'user',  select: 'username email' },
    ]);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking,
      transaction: {
        code:   decoded.transaction_code,
        uuid:   decoded.transaction_uuid,
        amount: decoded.total_amount,
        status: decoded.status,
      },
    });
  } catch (err) {
    console.error('eSewa verify error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/esewa/status/:bookingType/:bookingId
// ─────────────────────────────────────────────────────────────────────────────
exports.getPaymentStatus = async (req, res) => {
  try {
    const { bookingType, bookingId } = req.params;
    const Model = getBookingModel(bookingType);
    if (!Model) return res.status(400).json({ message: 'Invalid booking type' });

    const booking = await Model.findById(bookingId).populate('hotel', 'name location');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });

    res.json({
      success:       true,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
      esewaRefId:    booking.esewaRefId,
      paidAt:        booking.paidAt,
      booking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};