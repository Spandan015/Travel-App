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
  specialRequests: {
    type: String,
    trim: true
  },
  contactInfo: {
    name: String,
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

// Index for efficient queries
hotelBookingSchema.index({ user: 1, status: 1 });
hotelBookingSchema.index({ hotel: 1, status: 1 });
hotelBookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('HotelBooking', hotelBookingSchema);









