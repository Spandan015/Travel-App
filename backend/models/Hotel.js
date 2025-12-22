const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    
    // Hotel details
    starRating: { type: Number, min: 1, max: 5 },
    amenities: [{ type: String }], // e.g., ['WiFi', 'Pool', 'Gym', 'Restaurant']
    roomTypes: [{
      type: { type: String }, // e.g., 'Single', 'Double', 'Suite'
      description: { type: String },
      price: { type: Number },
      capacity: { type: Number }
    }],
    
    // Images
    images: [{ type: String }], // URLs to images
    mainImage: { type: String },
    
    // Contact
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    
    // Ratings and reviews
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    
    // Availability
    isActive: { type: Boolean, default: true },
    
    // Added by admin
    addedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', hotelSchema);