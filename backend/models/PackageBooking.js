const mongoose = require('mongoose');

const packageBookingSchema = new mongoose.Schema({
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelPackage', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  startDate:   { type: Date, required: true },
  endDate:     { type: Date },
  numberOfGuests: { type: Number, default: 1, min: 1 },
  specialRequests: { type: String, default: '' },

  totalPrice:  { type: Number, required: true },
  status:      { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },

  // Payment
  paymentStatus:  { type: String, enum: ['unpaid','pending','paid','failed'], default: 'unpaid' },
  paymentMethod:  { type: String, default: 'esewa' },
  esewaRefId:     { type: String },
  transactionUuid:{ type: String },
  paidAt:         { type: Date },

  cancellationReason: { type: String },
  contactInfo: {
    name:  String,
    email: String,
    phone: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('PackageBooking', packageBookingSchema);