const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  firstName: { type: String, trim: true },
  lastName:  { type: String, trim: true },
  phone:     { type: String, trim: true },
  username:  { type: String, trim: true },

  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true
  },

  googleId: { type: String, index: true, sparse: true },

  password: { type: String, select: false },

  role: {
    type:    String,
    enum:    ["user", "admin", "guide", "hotel_owner"],
    default: "user",
    index:   true
  },

  status: {
    type:    String,
    enum:    ["active", "pending", "suspended"],
    default: "active",
    index:   true
  },

  // ✅ Forces guide to change temp password on first login
  mustChangePassword: { type: Boolean, default: false },

  guideProfile: {
    bio:          { type: String },
    experience:   { type: Number },
    languages:    [{ type: String }],
    specialties:  [{ type: String }],
    hourlyRate:   { type: Number },
    dailyRate:    { type: Number },
    availability: { type: Boolean, default: true },
    rating:       { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    profileImage: { type: String },
    blockedDates: [{ type: String }],

    isApproved:      { type: Boolean, default: false },
    approvedAt:      { type: Date },
    rejectedAt:      { type: Date },
    rejectionReason: { type: String },
  },

  profileImage: { type: String },

  isActive: { type: Boolean, default: true },

  emailVerified:              { type: Boolean, default: false },
  isEmailVerified:            { type: Boolean, default: false },
  emailVerificationOTP:       { type: String },
  emailVerificationOTPExpires:{ type: Date },
  loginOTP:                   { type: String },
  loginOTPExpires:            { type: Date },
  otpAttempts:                { type: Number, default: 0 },
  otpBlockedUntil:            { type: Date },
},
{ timestamps: true }
);

// Remove sensitive data from API responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationOTP;
  delete obj.emailVerificationOTPExpires;
  delete obj.loginOTP;
  delete obj.loginOTPExpires;
  return obj;
};

// Pre-save hook
userSchema.pre("save", async function () {
  if ((!this.username || this.username.trim().length === 0) && (this.firstName || this.lastName)) {
    this.username = ((this.firstName || "") + " " + (this.lastName || "")).trim();
  }
  if (!this.username || this.username.trim().length === 0) {
    this.username = this.email ? this.email.split("@")[0] : "user";
  }
  if (this.emailVerified && !this.isEmailVerified) this.isEmailVerified = true;
  if (this.isEmailVerified && !this.emailVerified)  this.emailVerified  = true;
  if (this.status) {
    this.isActive = this.status === "active";
  } else if (typeof this.isActive === "boolean") {
    this.status = this.isActive ? "active" : "suspended";
  }
});

// Role helpers
userSchema.methods.isGuide = function () { return this.role === "guide"; };
userSchema.methods.isAdmin = function () { return this.role === "admin"; };

// Generate Email OTP
userSchema.methods.generateEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP        = otp;
  this.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
  this.otpAttempts    = 0;
  this.otpBlockedUntil = undefined;
  return otp;
};

// Generate Login OTP
userSchema.methods.generateLoginOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.loginOTP        = otp;
  this.loginOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
  this.otpAttempts    = 0;
  this.otpBlockedUntil = undefined;
  return otp;
};

// Verify Email OTP
userSchema.methods.verifyEmailOTP = function (otp) {
  const stored   = String(this.emailVerificationOTP || "").trim();
  const received = String(otp || "").trim();
  if (!stored) return false;
  if (this.emailVerificationOTPExpires < new Date()) return false;
  if (stored !== received) {
    this.otpAttempts += 1;
    if (this.otpAttempts >= 3) this.otpBlockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    return false;
  }
  this.isEmailVerified             = true;
  this.emailVerified               = true;
  this.emailVerificationOTP        = undefined;
  this.emailVerificationOTPExpires = undefined;
  this.otpAttempts    = 0;
  this.otpBlockedUntil = undefined;
  return true;
};

// Verify Login OTP
userSchema.methods.verifyLoginOTP = function (otp) {
  const stored   = String(this.loginOTP || "").trim();
  const received = String(otp || "").trim();
  if (!stored) return false;
  if (this.loginOTPExpires < new Date()) return false;
  if (stored !== received) {
    this.otpAttempts += 1;
    if (this.otpAttempts >= 3) this.otpBlockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    return false;
  }
  this.loginOTP        = undefined;
  this.loginOTPExpires = undefined;
  this.otpAttempts    = 0;
  this.otpBlockedUntil = undefined;
  return true;
};

// Check OTP block
userSchema.methods.isOTPBlocked = function () {
  return !!(this.otpBlockedUntil && this.otpBlockedUntil > new Date());
};

module.exports = mongoose.model("User", userSchema);