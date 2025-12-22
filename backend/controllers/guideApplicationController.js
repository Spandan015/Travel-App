const GuideApplication = require('../models/GuideApplication');
const User = require('../models/User');

// User applies to become a guide
exports.applyAsGuide = async (req, res) => {
  try {
    const { bio, experience, languages, specialties, hourlyRate, dailyRate, profileImage, certifications, idProof } = req.body;
    
    // Validation
    if (!bio || !experience || !languages || !specialties || !hourlyRate || !dailyRate) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    
    // Check if user already has a pending application
    const existingApplication = await GuideApplication.findOne({
      user: req.user.id,
      status: 'pending'
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: "You already have a pending application" });
    }
    
    // Check if user is already a guide
    if (req.user.role === 'guide') {
      return res.status(400).json({ message: "You are already a guide" });
    }
    
    const application = await GuideApplication.create({
      user: req.user.id,
      bio,
      experience,
      languages,
      specialties,
      hourlyRate,
      dailyRate,
      profileImage,
      certifications,
      idProof
    });
    
    res.status(201).json({
      success: true,
      message: "Guide application submitted successfully. Please wait for admin approval.",
      application
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's own application status
exports.getMyApplication = async (req, res) => {
  try {
    const application = await GuideApplication.findOne({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'username email');
    
    if (!application) {
      return res.status(404).json({ message: "No application found" });
    }
    
    res.json({
      success: true,
      application
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all guide applications
exports.getAllApplications = async (req, res) => {
  try {
    const { status } = req.query; // Filter by status: pending, approved, rejected
    
    const filter = {};
    if (status) {
      filter.status = status;
    }
    
    const applications = await GuideApplication.find(filter)
      .populate('user', 'username email phone profileImage')
      .populate('reviewedBy', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get single application details
exports.getApplicationById = async (req, res) => {
  try {
    const application = await GuideApplication.findById(req.params.id)
      .populate('user', 'username email phone profileImage')
      .populate('reviewedBy', 'username email');
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.json({
      success: true,
      application
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Approve guide application
exports.approveApplication = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const application = await GuideApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({ message: "Application has already been reviewed" });
    }
    
    // Update application status
    application.status = 'approved';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    application.adminNotes = adminNotes;
    await application.save();
    
    // Update user role to guide
    const user = await User.findById(application.user);
    user.role = 'guide';
    user.guideProfile = {
      bio: application.bio,
      experience: application.experience,
      languages: application.languages,
      specialties: application.specialties,
      hourlyRate: application.hourlyRate,
      dailyRate: application.dailyRate,
      profileImage: application.profileImage,
      isApproved: true,
      approvedAt: new Date()
    };
    await user.save();
    
    res.json({
      success: true,
      message: "Guide application approved successfully",
      application
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Reject guide application
exports.rejectApplication = async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: "Please provide a rejection reason" });
    }
    
    const application = await GuideApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({ message: "Application has already been reviewed" });
    }
    
    // Update application status
    application.status = 'rejected';
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    application.rejectionReason = rejectionReason;
    application.adminNotes = adminNotes;
    await application.save();
    
    res.json({
      success: true,
      message: "Guide application rejected",
      application
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Guide: Update guide profile
exports.updateGuideProfile = async (req, res) => {
  try {
    const { bio, languages, specialties, hourlyRate, dailyRate, availability, profileImage } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.guideProfile) {
      return res.status(400).json({ message: "You are not a guide" });
    }
    
    // Update guide profile fields
    if (bio) user.guideProfile.bio = bio;
    if (languages) user.guideProfile.languages = languages;
    if (specialties) user.guideProfile.specialties = specialties;
    if (hourlyRate) user.guideProfile.hourlyRate = hourlyRate;
    if (dailyRate) user.guideProfile.dailyRate = dailyRate;
    if (typeof availability !== 'undefined') user.guideProfile.availability = availability;
    if (profileImage) user.guideProfile.profileImage = profileImage;
    
    await user.save();
    
    const userSafe = user.toObject();
    delete userSafe.password;
    
    res.json({
      success: true,
      message: "Guide profile updated successfully",
      user: userSafe
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};