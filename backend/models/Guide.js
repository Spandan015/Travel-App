const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    yearsExperience: { type: Number, required: true, min: 0 },
    specializations: { type: [String], required: true, default: [] },
    languages: { type: [String], required: true, default: [] },
    bio: { type: String, required: true, minlength: 100, maxlength: 500 },
    licenseNumber: { type: String, trim: true },
    applicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    adminNotes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guide', guideSchema);

