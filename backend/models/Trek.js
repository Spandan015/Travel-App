const mongoose = require('mongoose');

const trekSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  region:      { type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true },
  tagline:     { type: String },
  overview:    { type: String, required: true },

  duration:       { type: Number, required: true },
  maxAltitude:    { type: Number },
  difficulty:     { type: String, enum: ['Easy','Moderate','Challenging','Expert'], default: 'Moderate' },
  bestSeason:     { type: String },
  tripType:       { type: String, default: 'Tea House' },
  transportation: { type: String, default: 'Flight' },
  accommodation:  { type: String, default: 'Lodge' },
  groupSize:      { type: String },
  startPoint:     { type: String },
  endPoint:       { type: String },

  price:         { type: Number, required: true },
  priceUSD:      { type: Number },
  priceIncludes: [{ type: String }],
  priceExcludes: [{ type: String }],

  itinerary: [{
    day:           { type: Number, required: true },
    title:         { type: String, required: true },
    description:   { type: String },
    elevation:     { type: Number },
    distance:      { type: String },
    walkingHours:  { type: String },
    meals:         { type: String, default: 'Breakfast, Lunch & Dinner' },
    accommodation: { type: String, default: 'Lodge' },
  }],

  gearList:  [{ type: String }],
  faqs: [{
    question: { type: String },
    answer:   { type: String },
  }],
  highlights:  [{ type: String }],
  images:      [{ type: String }],
  coverImage:  { type: String },

  altitudeProfile: [{
    day:       { type: Number },
    elevation: { type: Number },
    label:     { type: String },
  }],

  permits: [{ type: String }],

  isActive:   { type: Boolean, default: true },
  isPopular:  { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },

  totalReviews: { type: Number, default: 0 },
  rating:       { type: Number, default: 0, min: 0, max: 5 },

  // ── Guide Assignment ───────────────────────────────────────────────────────
  // Admin pre-links specific guides to this trek.
  // Users see only these guides when booking.
  availableGuides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

trekSchema.index({ slug: 1 });
trekSchema.index({ region: 1, isActive: 1 });
trekSchema.index({ name: 'text', overview: 'text' });

module.exports = mongoose.model('Trek', trekSchema);