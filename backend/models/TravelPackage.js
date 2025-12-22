const mongoose = require('mongoose');

const travelPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // in days
    price: { type: Number, required: true },
    
    // Destinations included in package
    destinations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    }],
    
    // What's included
    includes: {
      accommodation: { type: Boolean, default: false },
      meals: { type: String }, // e.g., 'Breakfast only', 'All meals', 'None'
      transport: { type: Boolean, default: false },
      guide: { type: Boolean, default: false },
      activities: [{ type: String }] // e.g., ['City Tour', 'Museum Visit']
    },
    
    // Package details
    maxGroupSize: { type: Number },
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Moderate', 'Challenging', 'Expert'] 
    },
    
    // Images
    images: [{ type: String }],
    mainImage: { type: String },
    
    // Itinerary
    itinerary: [{
      day: { type: Number },
      title: { type: String },
      description: { type: String },
      activities: [{ type: String }]
    }],
    
    // Hotel included (if accommodation is true)
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel'
    },
    
    // Ratings
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    
    // Availability
    isActive: { type: Boolean, default: true },
    availableFrom: { type: Date },
    availableTo: { type: Date },
    
    // Added by admin
    addedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TravelPackage', travelPackageSchema);