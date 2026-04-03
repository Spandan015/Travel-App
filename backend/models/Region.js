const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },       // e.g. "Everest Region"
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g. "everest-region"
  tagline: { type: String },                                 // e.g. "Journey to the Roof of the World"
  description: { type: String, required: true },
  highlights: [{ type: String }],                            // key bullet points about the region
  maxAltitude: { type: Number },                             // e.g. 8848
  bestSeason: { type: String },                              // e.g. "March-May, Sep-Nov"
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging', 'Expert'] },
  trekDuration: { type: String },                            // e.g. "7-21 days"
  startingPoint: { type: String },                           // e.g. "Lukla"
  image: { type: String },                                   // hero/cover image URL
  coverGradient: { type: String, default: 'linear-gradient(135deg, #0a2818 0%, #1a4a2a 100%)' },
  packageRegionKeyword: { type: String },                    // keyword to match packages e.g. "Everest"
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

regionSchema.index({ slug: 1 });
regionSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Region', regionSchema);