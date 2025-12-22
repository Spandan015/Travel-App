const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { 
      type: String, 
      enum: ['user', 'admin', 'guide'], 
      default: 'user' 
    },
    
    // Guide-specific fields (only filled if role is 'guide')
    guideProfile: {
      bio: { type: String },
      experience: { type: Number }, // years of experience
      languages: [{ type: String }], // e.g., ['English', 'Spanish', 'French']
      specialties: [{ type: String }], // e.g., ['Hiking', 'Cultural Tours', 'Food Tours']
      hourlyRate: { type: Number }, // price per hour
      dailyRate: { type: Number }, // price per day
      availability: { type: Boolean, default: true },
      rating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      profileImage: { type: String },
      isApproved: { type: Boolean, default: false }, // Admin approval status
      approvedAt: { type: Date },
      rejectedAt: { type: Date },
      rejectionReason: { type: String }
    },
    
    // User profile fields
    phone: { type: String },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Remove password when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Method to check if user is guide
userSchema.methods.isGuide = function () {
  return this.role === 'guide';
};

// Method to check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

module.exports = mongoose.model("User", userSchema);