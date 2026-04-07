const User = require("../models/User");
const Booking = require("../models/booking");
const TravelPackage = require("../models/TravelPackage");
const Hotel = require("../models/Hotel");
const Guide = require("../models/Guide");
const GuideApplication = require("../models/GuideApplication");

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalGuides = await User.countDocuments({ role: "guide" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const pendingApplications = await Guide.countDocuments({ applicationStatus: "pending" });
    const approvedApplications = await Guide.countDocuments({ applicationStatus: "approved" });
    const rejectedApplications = await Guide.countDocuments({ applicationStatus: "rejected" });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const completedBookings = await Booking.countDocuments({ status: "completed" });

    const allBookings = await Booking.find().populate("destination");
    const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, bookings: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const totalPackages = await TravelPackage.countDocuments({ isActive: true });
    const totalHotels = await Hotel.countDocuments({ isActive: true });

    const recentBookings = await Booking.find()
      .populate("user", "firstName lastName email")
      .populate("destination", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentApplications = await Guide.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(3);

    const topDestinations = await Booking.aggregate([
      { $group: { _id: "$destination", bookingCount: { $sum: 1 }, totalRevenue: { $sum: "$totalPrice" } } },
      { $lookup: { from: "destinations", localField: "_id", foreignField: "_id", as: "destination" } },
      { $unwind: "$destination" },
      { $project: { name: "$destination.name", bookingCount: 1, totalRevenue: 1 } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
    ]);

    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, role: "user" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        users: { total: totalUsers, guides: totalGuides, admins: totalAdmins, registrations: userRegistrations },
        guides: { pending: pendingApplications, approved: approvedApplications, rejected: rejectedApplications },
        bookings: { total: totalBookings, confirmed: confirmedBookings, pending: pendingBookings, completed: completedBookings },
        revenue: { total: totalRevenue, monthly: monthlyRevenue },
        packages: { total: totalPackages, active: totalPackages },
        hotels: { total: totalHotels },
        topDestinations,
        recentBookings,
        recentApplications,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics data" });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password -emailVerificationOTP -loginOTP")
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, message: `User ${isActive ? "activated" : "deactivated"} successfully`, user });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Error updating user status" });
  }
};

// ─── GUIDE APPLICATION MANAGEMENT (uses Guide model) ────────────────────────

// Get all guide applications
exports.getGuideApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.applicationStatus = status;

    const guides = await Guide.find(filter)
      .populate("user", "firstName lastName email phone")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: guides.length, applications: guides });
  } catch (error) {
    console.error("Error fetching guide applications:", error);
    res.status(500).json({ message: "Error fetching guide applications" });
  }
};

// Get single guide application
exports.getGuideApplicationById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate("user", "firstName lastName email phone")
      .populate("reviewedBy", "firstName lastName email");

    if (!guide) return res.status(404).json({ message: "Application not found" });
    res.json({ success: true, application: guide });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a guide application — FIX: also sets User.status = 'active'
exports.approveGuideApplication = async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const guide = await Guide.findById(req.params.id).populate("user");
    if (!guide) return res.status(404).json({ message: "Application not found" });
    if (guide.applicationStatus !== "pending")
      return res.status(400).json({ message: "Application has already been reviewed" });

    // Update Guide record
    guide.applicationStatus = "approved";
    guide.reviewedBy = req.user.id;
    guide.reviewedAt = new Date();
    if (adminNotes) guide.adminNotes = adminNotes;
    await guide.save();

    // Update User — set status to 'active' so they can log in
    await User.findByIdAndUpdate(guide.user._id, {
      status: "active",
      isActive: true,
    });

    res.json({ success: true, message: "Guide approved successfully. They can now log in.", application: guide });
  } catch (error) {
    console.error("Error approving guide:", error);
    res.status(500).json({ message: error.message });
  }
};

// Reject a guide application
exports.rejectGuideApplication = async (req, res) => {
  try {
    const { rejectionReason, adminNotes } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: "Please provide a rejection reason" });

    const guide = await Guide.findById(req.params.id).populate("user");
    if (!guide) return res.status(404).json({ message: "Application not found" });
    if (guide.applicationStatus !== "pending")
      return res.status(400).json({ message: "Application has already been reviewed" });

    guide.applicationStatus = "rejected";
    guide.reviewedBy = req.user.id;
    guide.reviewedAt = new Date();
    guide.rejectionReason = rejectionReason;
    if (adminNotes) guide.adminNotes = adminNotes;
    await guide.save();

    // Keep user status as pending/suspended so they cannot log in
    await User.findByIdAndUpdate(guide.user._id, { status: "suspended", isActive: false });

    res.json({ success: true, message: "Guide application rejected.", application: guide });
  } catch (error) {
    console.error("Error rejecting guide:", error);
    res.status(500).json({ message: error.message });
  }
};