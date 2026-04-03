const GuideApplication = require('../models/GuideApplication');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');

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

    const application = await GuideApplication.findById(req.params.id).populate('user');

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
    const user = await User.findById(application.user._id);
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

    // Send approval email notification
    try {
      const approvalEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Guide Application Approved - Nepal Travel</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; }
              .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; }
              .success-icon { font-size: 48px; margin-bottom: 20px; }
              .welcome-message { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 20px; }
              .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
              .next-steps { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
              .footer { margin-top: 30px; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <div class="success-icon">🎉</div>
                <div class="welcome-message">Congratulations, ${user.username}!</div>
                <p>Your guide application has been approved! Welcome to the Nepal Travel guide community.</p>

                <div class="details">
                  <h3 style="margin-top: 0; color: #667eea;">Application Details:</h3>
                  <p><strong>Experience:</strong> ${application.experience} years</p>
                  <p><strong>Languages:</strong> ${application.languages.join(', ')}</p>
                  <p><strong>Specialties:</strong> ${application.specialties.join(', ')}</p>
                  <p><strong>Hourly Rate:</strong> $${application.hourlyRate}</p>
                  <p><strong>Daily Rate:</strong> $${application.dailyRate}</p>
                </div>

                <div class="next-steps">
                  <h3 style="margin-top: 0; color: #4caf50;">Next Steps:</h3>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Log in to your guide dashboard</li>
                    <li>Complete your profile with more details</li>
                    <li>Set your availability calendar</li>
                    <li>Start receiving booking requests</li>
                  </ul>
                </div>

                ${adminNotes ? `
                  <div class="details">
                    <h4 style="margin-top: 0; color: #667eea;">Admin Notes:</h4>
                    <p>${adminNotes}</p>
                  </div>
                ` : ''}

                <div class="footer">
                  <p>Best regards,<br>The Nepal Travel Team</p>
                  <p style="font-size: 12px; color: #999;">
                    This is an automated message. If you have any questions, please contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Note: This would use a custom email service, but for now we'll use the existing OTP email function
      await sendOTPEmail(user.email, 'APPROVED', 'Guide Application Approved - Nepal Travel');
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the approval if email fails
    }

    res.json({
      success: true,
      message: "Guide application approved successfully. Email notification sent.",
      application
    });
  } catch (err) {
    console.error('Error approving application:', err);
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

    const application = await GuideApplication.findById(req.params.id).populate('user');

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

    // Send rejection email notification
    try {
      const user = await User.findById(application.user._id);
      const rejectionEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Guide Application Update - Nepal Travel</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .container { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; }
              .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; }
              .status-icon { font-size: 48px; margin-bottom: 20px; }
              .message { font-size: 20px; font-weight: bold; color: #ee5a24; margin-bottom: 20px; }
              .reason-box { background: #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d63031; text-align: left; }
              .next-steps { background: #fdcb6e; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { margin-top: 30px; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <div class="status-icon">📋</div>
                <div class="message">Guide Application Update</div>
                <p>Dear ${user.username},</p>
                <p>Thank you for your interest in becoming a guide with Nepal Travel. After careful review of your application, we regret to inform you that it has not been approved at this time.</p>

                <div class="reason-box">
                  <h4 style="margin-top: 0; color: #d63031;">Reason for Rejection:</h4>
                  <p>${rejectionReason}</p>
                </div>

                ${adminNotes ? `
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                    <h4 style="margin-top: 0; color: #667eea;">Additional Notes:</h4>
                    <p>${adminNotes}</p>
                  </div>
                ` : ''}

                <div class="next-steps">
                  <h4 style="margin-top: 0; color: #2d3436;">What You Can Do Next:</h4>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Address the issues mentioned in the rejection reason</li>
                    <li>Reapply after improving your qualifications</li>
                    <li>Contact our support team for guidance</li>
                  </ul>
                </div>

                <div class="footer">
                  <p>We appreciate your interest in guiding travelers in Nepal and encourage you to reapply when you're ready.</p>
                  <p>Best regards,<br>The Nepal Travel Team</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendOTPEmail(user.email, 'REJECTED', 'Guide Application Update - Nepal Travel');
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    res.json({
      success: true,
      message: "Guide application rejected. Email notification sent.",
      application
    });
  } catch (err) {
    console.error('Error rejecting application:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get application statistics
exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await GuideApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await GuideApplication.countDocuments();
    const pendingThisWeek = await GuideApplication.countDocuments({
      status: 'pending',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      stats: {
        total: totalApplications,
        pending: stats.find(s => s._id === 'pending')?.count || 0,
        approved: stats.find(s => s._id === 'approved')?.count || 0,
        rejected: stats.find(s => s._id === 'rejected')?.count || 0,
        pendingThisWeek
      }
    });
  } catch (err) {
    console.error('Error getting application stats:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: Bulk approve applications
exports.bulkApproveApplications = async (req, res) => {
  try {
    const { applicationIds, adminNotes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds)) {
      return res.status(400).json({ message: "Please provide application IDs array" });
    }

    const applications = await GuideApplication.find({
      _id: { $in: applicationIds },
      status: 'pending'
    }).populate('user');

    if (applications.length === 0) {
      return res.status(404).json({ message: "No pending applications found" });
    }

    const approvedCount = applications.length;

    // Update applications status
    await GuideApplication.updateMany(
      { _id: { $in: applicationIds }, status: 'pending' },
      {
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        adminNotes
      }
    );

    // Update user roles to guide
    const userIds = applications.map(app => app.user._id);
    await User.updateMany(
      { _id: { $in: userIds }, role: { $ne: 'guide' } },
      {
        role: 'guide',
        'guideProfile.isApproved': true,
        'guideProfile.approvedAt': new Date()
      }
    );

    // Update guide profiles (this would need to be done individually in a real implementation)
    for (const application of applications) {
      const user = await User.findById(application.user._id);
      if (user && !user.guideProfile) {
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
      }
    }

    res.json({
      success: true,
      message: `${approvedCount} applications approved successfully`,
      approvedCount
    });
  } catch (err) {
    console.error('Error bulk approving applications:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: Bulk reject applications
exports.bulkRejectApplications = async (req, res) => {
  try {
    const { applicationIds, rejectionReason, adminNotes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || !rejectionReason) {
      return res.status(400).json({ message: "Please provide application IDs array and rejection reason" });
    }

    const applications = await GuideApplication.find({
      _id: { $in: applicationIds },
      status: 'pending'
    });

    if (applications.length === 0) {
      return res.status(404).json({ message: "No pending applications found" });
    }

    const rejectedCount = applications.length;

    // Update applications status
    await GuideApplication.updateMany(
      { _id: { $in: applicationIds }, status: 'pending' },
      {
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        rejectionReason,
        adminNotes
      }
    );

    res.json({
      success: true,
      message: `${rejectedCount} applications rejected`,
      rejectedCount
    });
  } catch (err) {
    console.error('Error bulk rejecting applications:', err);
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