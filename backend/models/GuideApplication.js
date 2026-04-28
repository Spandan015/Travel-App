const mongoose = require('mongoose');

const guideApplicationSchema = new mongoose.Schema(
  {
    // ── Linked user (if already registered) ──────────────────
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ── Personal Information ──────────────────────────────────
    fullName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, required: true },
    dateOfBirth: { type: Date },
    address: {
      city:    { type: String },
      country: { type: String, default: 'Nepal' },
      street:  { type: String },
    },

    // ── Emergency Contact ─────────────────────────────────────
    emergencyContact: {
      name:         { type: String },
      phone:        { type: String },
      relationship: { type: String },
    },

    // ── Professional Details ──────────────────────────────────
    yearsExperience:     { type: Number, default: 0 },
    specializations:     [{ type: String }],   // trekking, cultural, city, food, etc.
    languages:           [{ type: String }],
    bio:                 { type: String, maxlength: 2000 },
    preferredDestinations: [{ type: String }], // regions/destinations they cover

    // ── Pricing ───────────────────────────────────────────────
    hourlyRate: { type: Number, default: 0 },
    dailyRate:  { type: Number, default: 0 },

    // ── Documents (file paths or URLs) ────────────────────────
    documents: {
      profilePhoto:    { type: String },  // mandatory
      governmentId:    { type: String },  // citizenship / passport — mandatory
      guideLicense:    { type: String },  // optional
      certifications:  [{ type: String }], // optional — multiple
      cv:              { type: String },  // CV / portfolio — optional
      introVideo:      { type: String },  // optional
    },

    // ── Application Status ────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },

    // ── Admin Review ──────────────────────────────────────────
    reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt:   { type: Date },
    reviewNotes:  { type: String },

    // Optional scoring (1–10)
    scores: {
      authenticity:     { type: Number, min: 1, max: 10 },
      communicationQuality: { type: Number, min: 1, max: 10 },
      localExpertise:   { type: Number, min: 1, max: 10 },
      safetyConfidence: { type: Number, min: 1, max: 10 },
    },

    rejectionReason: { type: String },

    // ── Post-approval ─────────────────────────────────────────
    tempPasswordSent:       { type: Boolean, default: false },
    tempPasswordSentAt:     { type: Date },
    mustChangePassword:     { type: Boolean, default: false },

    // ── Reapplication tracking ────────────────────────────────
    reapplicationCount: { type: Number, default: 0 },
    previousApplications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GuideApplication' }],

    // ── Submission meta ───────────────────────────────────────
    submittedAt: { type: Date, default: Date.now },
    ipAddress:   { type: String },
  },
  { timestamps: true }
);

// Index for fast admin queries
guideApplicationSchema.index({ status: 1, createdAt: -1 });
guideApplicationSchema.index({ email: 1 });

module.exports = mongoose.model('GuideApplication', guideApplicationSchema);