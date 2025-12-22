const mongoose = require('mongoose');

const guideBookingSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    guide: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    
    // Booking details
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    // Duration and pricing
    durationType: { 
      type: String, 
      enum: ['hourly', 'daily'], 
      required: true 
    },
    duration: { type: Number, required: true }, // hours or days
    pricePerUnit: { type: Number, required: true }, // hourly or daily rate
    totalPrice: { type: Number, required: true },
    
    // Number of people
    numberOfPeople: { type: Number, required: true, default: 1 },
    
    // Special requests
    specialRequests: { type: String },
    tourType: { type: String }, // e.g., 'Cultural', 'Adventure', 'Food'
    
    // Status
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], 
      default: 'pending' 
    },
    
    // Guide response
    guideResponse: {
      respondedAt: { type: Date },
      message: { type: String }
    },
    
    // Cancellation
    cancelledBy: { 
      type: String, 
      enum: ['user', 'guide', 'admin'] 
    },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    
    // Payment status (optional for future)
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'refunded'], 
      default: 'pending' 
    },
    
    // Review (after completion)
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      reviewedAt: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GuideBooking', guideBookingSchema);