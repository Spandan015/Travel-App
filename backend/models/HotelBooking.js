const mongoose = require('mongoose');

const hotelBookingSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  numberOfRooms: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },

  // ── NEW: store which room type was selected ──────────────────
  roomType: {
    type: String,
    default: null   // null = hotel booked without a specific room type (legacy bookings)
  },
  // ─────────────────────────────────────────────────────────────

  totalPrice: {
    type: Number,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  // eSewa Payment Fields
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'paid', 'failed'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['esewa', 'cash', 'bank_transfer'],
    default: null
  },
  transactionUuid: {
    type: String,
    default: null
  },
  esewaRefId: {
    type: String,   // eSewa's transaction_code
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },

  specialRequests: {
    type: String,
    trim: true
  },
  contactInfo: {
    name:  String,
    email: String,
    phone: String
  },
  cancellationReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

hotelBookingSchema.index({ user: 1, status: 1 });
hotelBookingSchema.index({ hotel: 1, status: 1 });
hotelBookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
hotelBookingSchema.index({ transactionUuid: 1 });

module.exports = mongoose.model('HotelBooking', hotelBookingSchema);