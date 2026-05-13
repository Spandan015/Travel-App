const mongoose = require('mongoose');

const travelPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },

    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],

    includes: {
      accommodation: { type: Boolean, default: false },
      meals: { type: String },
      transport: { type: Boolean, default: false },
      guide: { type: Boolean, default: false },
      activities: [{ type: String }]
    },

    maxGroupSize: { type: Number },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging', 'Expert']
    },

    images: [{ type: String }],
    mainImage: { type: String },

    itinerary: [{
      day: { type: Number },
      title: { type: String },
      description: { type: String },
      activities: [{ type: String }]
    }],

    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },

    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
    availableFrom: { type: Date },
    availableTo: { type: Date },

    // ── Guide Assignment ───────────────────────────────────────────────────
    // Admin pre-links specific guides to this package.
    // Users see only these guides when booking.
    availableGuides: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TravelPackage', travelPackageSchema);