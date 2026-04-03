const User = require("../models/User");
const Booking = require("../models/booking");
const TravelPackage = require("../models/TravelPackage");
const Hotel = require("../models/Hotel");
const GuideApplication = require("../models/GuideApplication");

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalGuides = await User.countDocuments({ role: 'guide' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Guide applications statistics
    const pendingApplications = await GuideApplication.countDocuments({ status: 'pending' });
    const approvedApplications = await GuideApplication.countDocuments({ status: 'approved' });
    const rejectedApplications = await GuideApplication.countDocuments({ status: 'rejected' });

    // Booking statistics
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Revenue calculations
    const allBookings = await Booking.find().populate('destination');
    const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Monthly revenue (last 12 months)
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Package statistics
    const totalPackages = await TravelPackage.countDocuments({ isActive: true });
    const activePackages = await TravelPackage.countDocuments({ isActive: true });

    // Hotel statistics
    const totalHotels = await Hotel.countDocuments({ isActive: true });

    // Recent activities
    const recentBookings = await Booking.find()
      .populate('user', 'username')
      .populate('destination', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentApplications = await GuideApplication.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(3);

    // Top destinations by bookings
    const topDestinations = await Booking.aggregate([
      {
        $group: {
          _id: "$destination",
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      {
        $lookup: {
          from: 'destinations',
          localField: '_id',
          foreignField: '_id',
          as: 'destination'
        }
      },
      {
        $unwind: '$destination'
      },
      {
        $project: {
          name: '$destination.name',
          bookingCount: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // User registration trends (last 30 days)
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          role: 'user'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          guides: totalGuides,
          admins: totalAdmins,
          registrations: userRegistrations
        },
        guides: {
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: pendingBookings,
          completed: completedBookings
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue
        },
        packages: {
          total: totalPackages,
          active: activePackages
        },
        hotels: {
          total: totalHotels
        },
        topDestinations,
        recentBookings,
        recentApplications
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password -emailVerificationOTP -loginOTP')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
};










