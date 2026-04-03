const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true }, // e.g., "Kathmandu Valley", "Pokhara", "Everest Region"
  district: { type: String, required: true }, // Nepal district
  province: {
    type: String,
    required: true,
    enum: ['Province 1', 'Province 2', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']
  },
  description: { type: String, required: true },
  shortDescription: { type: String }, // Brief description for cards

  // Nepal-specific information
  altitude: { type: Number }, // in meters
  bestTimeToVisit: { type: String }, // e.g., "March-May, September-November"
  population: { type: Number },
  area: { type: Number }, // in square km

  // Categories and types
  category: {
    type: String,
    enum: ['City', 'Mountain', 'Lake', 'Temple', 'National Park', 'Cultural Site', 'Adventure Spot'],
    required: true
  },
  subcategories: [{ type: String }], // e.g., ['Trekking', 'Cultural Tours', 'Wildlife']

  // Images
  images: [{ type: String }],
  mainImage: { type: String },
  galleryImages: [{ type: String }],

  // Travel information
  travelTime: {
    byRoad: { type: String }, // e.g., "7 hours from Kathmandu"
    byAir: { type: String },   // e.g., "25 minutes flight"
  },
  entryFee: { type: Number }, // in NPR

  // Activities and attractions
  attractions: [{
    name: { type: String },
    description: { type: String },
    type: { type: String }, // e.g., 'Temple', 'Monument', 'Viewpoint'
    entryFee: { type: Number }
  }],

  activities: [{
    name: { type: String },
    description: { type: String },
    duration: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging', 'Expert'] },
    bestSeason: { type: String },
    price: { type: Number } // in USD
  }],

  // Accommodation options
  accommodation: {
    budget: { type: Boolean, default: false },
    midRange: { type: Boolean, default: false },
    luxury: { type: Boolean, default: false }
  },

  // Transport options
  transport: {
    bus: { type: Boolean, default: false },
    flight: { type: Boolean, default: false },
    jeep: { type: Boolean, default: false },
    trekking: { type: Boolean, default: false }
  },

  // Ratings and reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },

  // Geographic coordinates
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },

  // Status
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },

  // SEO and metadata
  seoTitle: { type: String },
  seoDescription: { type: String },
  keywords: [{ type: String }],

  // Added by admin
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Indexes for better search performance
destinationSchema.index({ name: 'text', description: 'text', location: 'text' });
destinationSchema.index({ category: 1, province: 1 });
destinationSchema.index({ isActive: 1, isPopular: 1 });

module.exports = mongoose.model('Destination', destinationSchema);
