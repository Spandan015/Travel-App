const mongoose = require('mongoose');

const trekSchema = new mongoose.Schema({
  // Basic Info
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  region:      { type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true },
  tagline:     { type: String },
  overview:    { type: String, required: true },

  // Trek Stats (shown in "Trip At Glance")
  duration:       { type: Number, required: true },       // days
  maxAltitude:    { type: Number },                       // meters
  difficulty:     { type: String, enum: ['Easy','Moderate','Challenging','Expert'], default: 'Moderate' },
  bestSeason:     { type: String },                       // e.g. "Autumn & Spring"
  tripType:       { type: String, default: 'Tea House' }, // Tea House / Camping
  transportation: { type: String, default: 'Flight' },
  accommodation:  { type: String, default: 'Lodge' },
  groupSize:      { type: String },                       // e.g. "2-16 people"
  startPoint:     { type: String },                       // e.g. "Lukla"
  endPoint:       { type: String },                       // e.g. "Kathmandu"

  // Pricing
  price:         { type: Number, required: true },        // NPR per person
  priceUSD:      { type: Number },                        // USD per person
  priceIncludes: [{ type: String }],
  priceExcludes: [{ type: String }],

  // Day-by-day Itinerary
  itinerary: [{
    day:           { type: Number, required: true },
    title:         { type: String, required: true },      // e.g. "KTM to Lukla Flight and Phadking"
    description:   { type: String },
    elevation:     { type: Number },                      // meters
    distance:      { type: String },                      // e.g. "10-12km"
    walkingHours:  { type: String },                      // e.g. "5-6 hours"
    meals:         { type: String, default: 'Breakfast, Lunch & Dinner' },
    accommodation: { type: String, default: 'Lodge' },
  }],

  // Gear List
  gearList: [{ type: String }],

  // FAQs
  faqs: [{
    question: { type: String },
    answer:   { type: String },
  }],

  // Highlights
  highlights: [{ type: String }],

  // Images
  images:    [{ type: String }],
  coverImage: { type: String },

  // Altitude profile data points (for chart)
  altitudeProfile: [{
    day:       { type: Number },
    elevation: { type: Number },
    label:     { type: String },
  }],

  // Permits required
  permits: [{ type: String }],   // e.g. ["TIMS Card", "Sagarmatha NP Permit"]

  // Status
  isActive:  { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  isFeatured:{ type: Boolean, default: false },

  // Meta
  totalReviews: { type: Number, default: 0 },
  rating:       { type: Number, default: 0, min: 0, max: 5 },
  addedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

trekSchema.index({ slug: 1 });
trekSchema.index({ region: 1, isActive: 1 });
trekSchema.index({ name: 'text', overview: 'text' });

module.exports = mongoose.model('Trek', trekSchema);