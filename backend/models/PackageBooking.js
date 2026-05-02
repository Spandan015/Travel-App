const mongoose = require('mongoose');

const packageBookingSchema = new mongoose.Schema({
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelPackage', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  startDate:      { type: Date, required: true },
  endDate:        { type: Date },
  numberOfGuests: { type: Number, default: 1, min: 1 },
  specialRequests:{ type: String, default: '' },

  totalPrice:  { type: Number, required: true },
  status:      { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },

  // ─── Guide Assignment (Phase 1 + 2) ───────────────────────────────────────
  // Set when user picks a guide at booking time OR admin assigns later
  assignedGuide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guideRequested: { type: Boolean, default: false }, // did user want a guide?

  // Revenue split: 75% guide / 25% platform
  guidePayment: {
    guideFee:       { type: Number, default: 0 }, // guide's 75%
    platformFee:    { type: Number, default: 0 }, // platform's 25%
    splitPercent:   { type: Number, default: 75 }, // guide's share %
    status:         { type: String, enum: ['pending','paid','na'], default: 'na' },
    paidAt:         { type: Date },
  },

  // Guide assignment metadata
  guideAssignedAt: { type: Date },
  guideAssignedBy: { type: String, enum: ['user','admin'], default: 'user' },
  guideNotes:      { type: String, default: '' }, // admin notes on assignment

  // Payment
  paymentStatus:   { type: String, enum: ['unpaid','pending','paid','failed'], default: 'unpaid' },
  paymentMethod:   { type: String, default: 'esewa' },
  esewaRefId:      { type: String },
  transactionUuid: { type: String },
  paidAt:          { type: Date },

  cancellationReason: { type: String },
  contactInfo: {
    name:  String,
    email: String,
    phone: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('PackageBooking', packageBookingSchema);