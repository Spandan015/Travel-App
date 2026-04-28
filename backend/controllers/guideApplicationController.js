const GuideApplication = require('../models/GuideApplication');
const User             = require('../models/User');
const EmailLog         = require('../models/EmailLog');
const { sendEmail }    = require('../utils/emailService');
const bcrypt           = require('bcryptjs');

// ─── Helper: generate a random temp password ────────────────────────────────
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
};

// ─── Helper: log sent email ──────────────────────────────────────────────────
const logEmail = async (data) => {
  try { await EmailLog.create(data); } catch {}
};

// ─── Helper: email templates ─────────────────────────────────────────────────
const approvalEmailHtml = (name, email, tempPassword, loginUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f0fdf4;margin:0;padding:20px;}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
    .hdr{background:linear-gradient(135deg,#0a2818,#1a4a2a);padding:36px 30px;text-align:center;}
    .hdr h1{color:#fff;margin:0;font-size:22px;font-weight:800;}
    .hdr p{color:#86efac;margin:8px 0 0;font-size:13px;}
    .badge{display:inline-block;background:#4ade80;color:#0a2818;font-weight:800;font-size:12px;border-radius:20px;padding:6px 18px;margin-top:16px;letter-spacing:1px;}
    .body{padding:32px 30px;}
    .greeting{font-size:20px;font-weight:700;color:#0a2818;margin-bottom:8px;}
    .text{color:#374151;font-size:14px;line-height:1.7;margin-bottom:20px;}
    .cred-box{background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px 24px;margin:20px 0;}
    .cred-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #d1fae5;}
    .cred-row:last-child{border-bottom:none;}
    .cred-label{font-size:13px;color:#6b7280;font-weight:600;}
    .cred-val{font-size:13px;color:#0a2818;font-weight:800;font-family:monospace;}
    .warn{background:#fffaeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;font-size:13px;color:#92400e;margin:16px 0;line-height:1.6;}
    .btn{display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;margin:20px 0;}
    .steps{background:#f8faf8;border-radius:10px;padding:16px 20px;font-size:13px;color:#374151;line-height:2;}
    .ftr{background:#0a2818;padding:20px 30px;text-align:center;}
    .ftr p{color:#86efac;font-size:12px;line-height:1.8;margin:0;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>🏔️ Nepal Travel</h1>
      <p>Your Gateway to the Himalayas</p>
      <div class="badge">✅ Application Approved</div>
    </div>
    <div class="body">
      <div class="greeting">Congratulations, ${name}! 🎉</div>
      <p class="text">
        We are thrilled to inform you that your guide application has been <strong>approved</strong>!
        You are now a verified guide on Nepal Travel. Below are your login credentials to access your guide dashboard.
      </p>

      <div class="cred-box">
        <div style="font-size:13px;font-weight:800;color:#0a2818;margin-bottom:12px;">🔐 Your Login Credentials</div>
        <div class="cred-row">
          <span class="cred-label">Email</span>
          <span class="cred-val">${email}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Temporary Password</span>
          <span class="cred-val">${tempPassword}</span>
        </div>
      </div>

      <div class="warn">
        ⚠️ <strong>Important:</strong> This is a temporary password. You will be required to set a new password
        immediately after your first login. Please keep this email safe and do not share your credentials.
      </div>

      <div style="text-align:center;">
        <a href="${loginUrl}" class="btn">Login to Your Dashboard →</a>
      </div>

      <div class="steps">
        <strong>📋 Getting Started:</strong><br/>
        1. Click the login button above and enter your credentials<br/>
        2. You will be prompted to set a new secure password<br/>
        3. Complete your guide profile with photo and bio<br/>
        4. Set your availability and start accepting bookings!
      </div>
    </div>
    <div class="ftr">
      <p>Welcome to the Nepal Travel guide family!<br/>
      For support, contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#4ade80;">${process.env.EMAIL_USER}</a></p>
    </div>
  </div>
</body>
</html>
`;

const rejectionEmailHtml = (name, reason) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
    .hdr{background:linear-gradient(135deg,#0a2818,#1a4a2a);padding:36px 30px;text-align:center;}
    .hdr h1{color:#fff;margin:0;font-size:22px;font-weight:800;}
    .hdr p{color:#86efac;margin:8px 0 0;font-size:13px;}
    .badge{display:inline-block;background:#fef2f2;color:#b91c1c;font-weight:800;font-size:12px;border-radius:20px;padding:6px 18px;margin-top:16px;letter-spacing:1px;border:1px solid #fca5a5;}
    .body{padding:32px 30px;}
    .greeting{font-size:20px;font-weight:700;color:#0a2818;margin-bottom:8px;}
    .text{color:#374151;font-size:14px;line-height:1.7;margin-bottom:20px;}
    .reason-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:16px 20px;font-size:14px;color:#7f1d1d;line-height:1.7;margin:16px 0;}
    .steps{background:#f0fdf4;border:1px solid #d1fae5;border-radius:10px;padding:16px 20px;font-size:13px;color:#166534;line-height:2;}
    .ftr{background:#0a2818;padding:20px 30px;text-align:center;}
    .ftr p{color:#86efac;font-size:12px;line-height:1.8;margin:0;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>🏔️ Nepal Travel</h1>
      <p>Your Gateway to the Himalayas</p>
      <div class="badge">Application Update</div>
    </div>
    <div class="body">
      <div class="greeting">Dear ${name},</div>
      <p class="text">
        Thank you for your interest in becoming a guide on Nepal Travel. After carefully reviewing
        your application, we are unable to approve it at this time.
      </p>

      <div class="reason-box">
        <strong>Reason for rejection:</strong><br/>
        ${reason || 'Your application did not meet our current verification requirements. Please review your submitted documents and information.'}
      </div>

      <div class="steps">
        <strong>📋 What you can do:</strong><br/>
        1. Review the reason above carefully<br/>
        2. Update or correct the information in your application<br/>
        3. Gather any missing documents (valid ID, certifications)<br/>
        4. Resubmit your application through the portal
      </div>

      <p style="color:#6b7280;font-size:13px;margin-top:20px;line-height:1.7;">
        We encourage you to reapply once you have addressed the concerns mentioned above.
        Our team looks forward to reviewing your updated application.
      </p>
    </div>
    <div class="ftr">
      <p>Nepal Travel Guide Team<br/>
      For questions, contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#4ade80;">${process.env.EMAIL_USER}</a></p>
    </div>
  </div>
</body>
</html>
`;

const suspendEmailHtml = (name, reason) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>body{font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;}.wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;}.hdr{background:linear-gradient(135deg,#0a2818,#1a4a2a);padding:36px 30px;text-align:center;}.hdr h1{color:#fff;margin:0;font-size:22px;}.body{padding:32px 30px;}.ftr{background:#0a2818;padding:20px;text-align:center;}</style>
</head>
<body>
  <div class="wrap">
    <div class="hdr"><h1>🏔️ Nepal Travel</h1></div>
    <div class="body">
      <h2 style="color:#0a2818;">Dear ${name},</h2>
      <p style="color:#374151;font-size:14px;line-height:1.7;">
        Your guide account has been temporarily <strong>suspended</strong> on Nepal Travel.
      </p>
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:16px;margin:16px 0;font-size:14px;color:#7f1d1d;">
        <strong>Reason:</strong> ${reason || 'Violation of platform guidelines.'}
      </div>
      <p style="color:#374151;font-size:13px;line-height:1.7;">
        Please contact our support team if you believe this is an error or to discuss reinstatement.
      </p>
    </div>
    <div class="ftr"><p style="color:#86efac;font-size:12px;margin:0;">Nepal Travel — <a href="mailto:${process.env.EMAIL_USER}" style="color:#4ade80;">${process.env.EMAIL_USER}</a></p></div>
  </div>
</body>
</html>
`;

// ════════════════════════════════════════════════════════════
// SUBMIT APPLICATION  POST /api/guide-applications
// ════════════════════════════════════════════════════════════
exports.submitApplication = async (req, res) => {
  try {
    const {
      fullName, email, phone, dateOfBirth,
      address, emergencyContact,
      yearsExperience, specializations, languages, bio,
      preferredDestinations, hourlyRate, dailyRate,
      documents,
    } = req.body;

    // Required field check
    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: 'Full name, email, and phone are required.' });
    }
    if (!documents?.profilePhoto) {
      return res.status(400).json({ message: 'Profile photo is required.' });
    }
    if (!documents?.governmentId) {
      return res.status(400).json({ message: 'Government ID is required for verification.' });
    }

    // Prevent duplicate pending applications
    const existing = await GuideApplication.findOne({ email, status: { $in: ['pending', 'under_review'] } });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending application under review.' });
    }

    // Count previous applications (reapplication tracking)
    const prevCount = await GuideApplication.countDocuments({ email, status: { $in: ['rejected'] } });

    const application = await GuideApplication.create({
      user:                req.user?._id,
      fullName, email, phone, dateOfBirth,
      address, emergencyContact,
      yearsExperience, specializations, languages, bio,
      preferredDestinations, hourlyRate, dailyRate,
      documents,
      reapplicationCount: prevCount,
      ipAddress: req.ip,
    });

    // Optional: send acknowledgement email
    try {
      await sendEmail({
        to: email,
        subject: '📋 Application Received – Nepal Travel Guide Program',
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#0a2818;">Hello ${fullName},</h2>
            <p style="color:#374151;line-height:1.7;">
              Thank you for applying to become a verified guide on Nepal Travel.
              Your application has been received and is now <strong>under review</strong>.
            </p>
            <p style="color:#374151;">Our admin team will review your profile, documents, and experience.
            You will receive an email once a decision has been made.</p>
            <p style="color:#6b7280;font-size:13px;">Application ID: <code>${application._id}</code></p>
          </div>
        `,
      });
      await logEmail({ recipient: email, type: 'guide_application_received', subject: 'Application Received', refApplication: application._id });
    } catch {}

    res.status(201).json({ success: true, message: 'Application submitted successfully!', application });
  } catch (err) {
    console.error('submitApplication error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// GET ALL APPLICATIONS (admin)  GET /api/guide-applications
// ════════════════════════════════════════════════════════════
exports.getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const total = await GuideApplication.countDocuments(filter);
    const applications = await GuideApplication.find(filter)
      .populate('user',       'firstName lastName email username')
      .populate('reviewedBy', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// GET SINGLE APPLICATION  GET /api/guide-applications/:id
// ════════════════════════════════════════════════════════════
exports.getApplicationById = async (req, res) => {
  try {
    const application = await GuideApplication.findById(req.params.id)
      .populate('user',       'firstName lastName email username phone role')
      .populate('reviewedBy', 'firstName lastName username');

    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// APPROVE APPLICATION  PUT /api/guide-applications/:id/approve
// ════════════════════════════════════════════════════════════
exports.approveApplication = async (req, res) => {
  try {
    const application = await GuideApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status === 'approved') return res.status(400).json({ message: 'Already approved' });

    const { reviewNotes, scores } = req.body;

    // Generate temp password
    const tempPassword = generateTempPassword();
    const hashedTemp   = await bcrypt.hash(tempPassword, 12);

    // Check if user account already exists for this email
    let guideUser = await User.findOne({ email: application.email });

    if (guideUser) {
      // Upgrade existing user to guide role
      guideUser.role               = 'guide';
      guideUser.status             = 'active';
      guideUser.mustChangePassword = true;
      guideUser.password           = hashedTemp;
      if (!guideUser.guideProfile) guideUser.guideProfile = {};
      guideUser.guideProfile.isApproved      = true;
      guideUser.guideProfile.approvedAt      = new Date();
      guideUser.guideProfile.bio             = application.bio             || guideUser.guideProfile.bio;
      guideUser.guideProfile.languages       = application.languages       || guideUser.guideProfile.languages;
      guideUser.guideProfile.specialties     = application.specializations || guideUser.guideProfile.specialties;
      guideUser.guideProfile.hourlyRate      = application.hourlyRate      || guideUser.guideProfile.hourlyRate;
      guideUser.guideProfile.dailyRate       = application.dailyRate       || guideUser.guideProfile.dailyRate;
      guideUser.guideProfile.experience      = application.yearsExperience || guideUser.guideProfile.experience;
      guideUser.guideProfile.profileImage    = application.documents?.profilePhoto || guideUser.guideProfile.profileImage;
      guideUser.guideProfile.availability    = true;
      await guideUser.save();
    } else {
      // Create new user account for the guide
      guideUser = await User.create({
        firstName:           application.fullName.split(' ')[0] || application.fullName,
        lastName:            application.fullName.split(' ').slice(1).join(' ') || '',
        username:            application.email.split('@')[0],
        email:               application.email,
        phone:               application.phone,
        password:            hashedTemp,
        role:                'guide',
        status:              'active',
        mustChangePassword:  true,
        guideProfile: {
          isApproved:    true,
          approvedAt:    new Date(),
          bio:           application.bio,
          languages:     application.languages,
          specialties:   application.specializations,
          hourlyRate:    application.hourlyRate,
          dailyRate:     application.dailyRate,
          experience:    application.yearsExperience,
          profileImage:  application.documents?.profilePhoto,
          availability:  true,
        },
      });
    }

    // Update application record
    application.status        = 'approved';
    application.reviewedBy    = req.user._id;
    application.reviewedAt    = new Date();
    application.reviewNotes   = reviewNotes || '';
    application.scores        = scores || {};
    application.tempPasswordSent   = true;
    application.tempPasswordSentAt = new Date();
    application.mustChangePassword = true;
    application.user = guideUser._id;
    await application.save();

    // Send approval email with temp password
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    try {
      await sendEmail({
        to:      application.email,
        subject: '🎉 Congratulations! Your Guide Application is Approved – Nepal Travel',
        html:    approvalEmailHtml(application.fullName, application.email, tempPassword, loginUrl),
      });
      await logEmail({
        recipient:      application.email,
        type:           'guide_approved',
        subject:        'Guide Application Approved',
        status:         'sent',
        refUser:        guideUser._id,
        refApplication: application._id,
      });
      console.log(`✅ Approval email with temp password sent to ${application.email}`);
    } catch (emailErr) {
      console.error('❌ Failed to send approval email:', emailErr.message);
      // Log the temp password to console as fallback
      console.log(`🔐 TEMP PASSWORD for ${application.email}: ${tempPassword}`);
      await logEmail({
        recipient:      application.email,
        type:           'guide_approved',
        status:         'failed',
        error:          emailErr.message,
        refApplication: application._id,
      });
    }

    res.json({
      success:  true,
      message:  'Application approved. Credentials sent to guide email.',
      guideUser: { _id: guideUser._id, email: guideUser.email, role: guideUser.role },
    });
  } catch (err) {
    console.error('approveApplication error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// REJECT APPLICATION  PUT /api/guide-applications/:id/reject
// ════════════════════════════════════════════════════════════
exports.rejectApplication = async (req, res) => {
  try {
    const application = await GuideApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status === 'approved') return res.status(400).json({ message: 'Cannot reject an already approved application' });

    const { rejectionReason, reviewNotes, scores } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: 'Rejection reason is required.' });

    application.status          = 'rejected';
    application.reviewedBy      = req.user._id;
    application.reviewedAt      = new Date();
    application.rejectionReason = rejectionReason;
    application.reviewNotes     = reviewNotes || '';
    application.scores          = scores || {};
    await application.save();

    // Send rejection email
    try {
      await sendEmail({
        to:      application.email,
        subject: 'Nepal Travel Guide Application Update',
        html:    rejectionEmailHtml(application.fullName, rejectionReason),
      });
      await logEmail({
        recipient:      application.email,
        type:           'guide_rejected',
        subject:        'Guide Application Rejected',
        status:         'sent',
        refApplication: application._id,
      });
    } catch (emailErr) {
      await logEmail({
        recipient:      application.email,
        type:           'guide_rejected',
        status:         'failed',
        error:          emailErr.message,
        refApplication: application._id,
      });
    }

    res.json({ success: true, message: 'Application rejected. Notification sent to applicant.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// SET TO UNDER REVIEW  PUT /api/guide-applications/:id/review
// ════════════════════════════════════════════════════════════
exports.markUnderReview = async (req, res) => {
  try {
    const application = await GuideApplication.findByIdAndUpdate(
      req.params.id,
      { status: 'under_review', reviewedBy: req.user._id },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ success: true, message: 'Marked as under review', application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// SAVE SCORES / NOTES  PUT /api/guide-applications/:id/score
// ════════════════════════════════════════════════════════════
exports.saveScores = async (req, res) => {
  try {
    const { scores, reviewNotes } = req.body;
    const application = await GuideApplication.findByIdAndUpdate(
      req.params.id,
      { scores, reviewNotes, reviewedBy: req.user._id },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// SUSPEND GUIDE  PUT /api/guide-applications/guides/:userId/suspend
// ════════════════════════════════════════════════════════════
exports.suspendGuide = async (req, res) => {
  try {
    const { reason } = req.body;
    const guide = await User.findOne({ _id: req.params.userId, role: 'guide' });
    if (!guide) return res.status(404).json({ message: 'Guide not found' });

    guide.status = 'suspended';
    if (guide.guideProfile) guide.guideProfile.availability = false;
    await guide.save();

    // Send suspension email
    try {
      await sendEmail({
        to:      guide.email,
        subject: 'Nepal Travel – Guide Account Suspended',
        html:    suspendEmailHtml(`${guide.firstName || guide.username}`, reason),
      });
    } catch {}

    res.json({ success: true, message: 'Guide suspended successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// REACTIVATE GUIDE  PUT /api/guide-applications/guides/:userId/reactivate
// ════════════════════════════════════════════════════════════
exports.reactivateGuide = async (req, res) => {
  try {
    const guide = await User.findOne({ _id: req.params.userId, role: 'guide' });
    if (!guide) return res.status(404).json({ message: 'Guide not found' });

    guide.status = 'active';
    await guide.save();

    // Notify guide
    try {
      await sendEmail({
        to:      guide.email,
        subject: '✅ Nepal Travel – Guide Account Reactivated',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#0a2818;">Hello ${guide.firstName || guide.username},</h2>
          <p style="color:#374151;line-height:1.7;">
            Your guide account on Nepal Travel has been <strong>reactivated</strong>.
            You can now log in and start accepting bookings again.
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
            style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:12px;">
            Login to Dashboard →
          </a>
        </div>`,
      });
    } catch {}

    res.json({ success: true, message: 'Guide reactivated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// GET ALL APPROVED GUIDES (admin)  GET /api/guide-applications/guides
// ════════════════════════════════════════════════════════════
exports.getAllGuides = async (req, res) => {
  try {
    const { status } = req.query; // active | suspended | all
    const filter = { role: 'guide' };
    if (status && status !== 'all') filter.status = status;

    const guides = await User.find(filter)
      .select('-password -mustChangePassword')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: guides.length, guides });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// FORCE CHANGE PASSWORD  PUT /api/auth/change-password
// (called on first login when mustChangePassword === true)
// ════════════════════════════════════════════════════════════
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });

    user.password            = await bcrypt.hash(newPassword, 12);
    user.mustChangePassword  = false;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully. Welcome aboard!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// GET EMAIL LOGS (admin)  GET /api/guide-applications/email-logs
// ════════════════════════════════════════════════════════════
exports.getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find({})
      .sort({ sentAt: -1 })
      .limit(100);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};