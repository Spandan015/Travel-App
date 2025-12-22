const mongoose = require('mongoose');

const guideApplicationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    bio: { type: String, required: true },
    experience: { type: Number, required: true }, // years
    languages: [{ type: String, required: true }],
    specialties: [{ type: String, required: true }],
    hourlyRate: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    profileImage: { type: String },
    
    // Certifications and documents
    certifications: [{ type: String }], // URLs to certificates
    idProof: { type: String }, // URL to ID document
    
    // Application status
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    reviewedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    adminNotes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GuideApplication', guideApplicationSchema);