const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    location:     { type: String, required: true },
    address:      { type: String, default: '' },
    description:  { type: String, default: '' },
    pricePerNight:{ type: Number, required: true },

    // Coordinates for map
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },

    // Hotel details
    starRating: { type: Number, min: 1, max: 5 },
    amenities:  [{ type: String }],

    // ── UPDATED: roomTypes now tracks availability per room type ──
    roomTypes: [{
      type:           { type: String },        // e.g. "Deluxe", "Suite", "Standard"
      description:    { type: String },
      price:          { type: Number },
      capacity:       { type: Number },
      totalRooms:     { type: Number, default: 0 },     // total physical rooms of this type
      availableRooms: { type: Number, default: 0 },     // decrements on booking, increments on cancel
    }],
    // ─────────────────────────────────────────────────────────────

    // Images
    images:    [{ type: String }],
    mainImage: { type: String },

    // Contact
    phone:   { type: String },
    email:   { type: String },
    website: { type: String },

    // Ratings and reviews
    rating:       { type: Number, default: 0 },
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