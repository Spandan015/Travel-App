const Business = require('../models/Business');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

exports.getPendingBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ verificationStatus: 'pending' })
      .populate('user', 'username firstName lastName email phone role status createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, businesses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveBusiness = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const business = await Business.findById(req.params.id).populate('user');
    if (!business) return res.status(404).json({ message: 'Registration not found' });
    if (business.verificationStatus !== 'pending') return res.status(400).json({ message: 'Registration already reviewed' });

    business.verificationStatus = 'verified';
    business.reviewedBy = req.user._id;
    business.reviewedAt = new Date();
    business.adminNotes = adminNotes;
    await business.save();

    const user = await User.findById(business.user._id);
    user.status = 'active';
    user.isActive = true;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Business Registration Approved - Nepal Travel',
      html: `<div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>Approved</h2>
        <p>Hi ${user.firstName || user.username}, your business registration has been approved. You can now sign in and access your dashboard.</p>
        ${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}
      </div>`
    });

    res.json({ success: true, message: 'Business approved', business });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectBusiness = async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;
    if (!rejectionReason?.trim()) return res.status(400).json({ message: 'Rejection reason is required' });

    const business = await Business.findById(req.params.id).populate('user');
    if (!business) return res.status(404).json({ message: 'Registration not found' });
    if (business.verificationStatus !== 'pending') return res.status(400).json({ message: 'Registration already reviewed' });

    business.verificationStatus = 'rejected';
    business.reviewedBy = req.user._id;
    business.reviewedAt = new Date();
    business.rejectionReason = rejectionReason;
    business.adminNotes = adminNotes;
    await business.save();

    const user = await User.findById(business.user._id);
    user.status = 'suspended';
    user.isActive = false;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Business Registration Update - Nepal Travel',
      html: `<div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>Registration Update</h2>
        <p>Hi ${user.firstName || user.username}, we could not approve your business registration.</p>
        <p><strong>Reason:</strong> ${rejectionReason}</p>
        ${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}
      </div>`
    });

    res.json({ success: true, message: 'Business rejected', business });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

