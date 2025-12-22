const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    
    // What is being reviewed
    reviewType: { 
      type: String, 
      enum: ['hotel', 'guide', 'package', 'destination'], 
      required: true 
    },
    
    // Reference to the item being reviewed
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelPackage' },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
    
    // Review content
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    
    // Images (optional)
    images: [{ type: String }],
    
    // Verification (user must have booked/used the service)
    verified: { type: Boolean, default: false },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId },
    
    // Helpful votes
    helpfulVotes: { type: Number, default: 0 },
    
    // Status
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for efficient queries
reviewSchema.index({ hotel: 1, createdAt: -1 });
reviewSchema.index({ guide: 1, createdAt: -1 });
reviewSchema.index({ package: 1, createdAt: -1 });
reviewSchema.index({ destination: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);