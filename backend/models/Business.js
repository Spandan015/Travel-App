const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    businessName: { type: String, required: true, trim: true },
    businessType: {
      type: String,
      required: true,
      enum: ['Hotel', 'Resort', 'Guesthouse', 'Homestay', 'Apartment', 'Lodge']
    },
    businessLicense: { type: String, trim: true },
    numberOfProperties: { type: String, required: true, enum: ['1', '2-5', '6-10', '10+'] },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
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

module.exports = mongoose.model('Business', businessSchema);

