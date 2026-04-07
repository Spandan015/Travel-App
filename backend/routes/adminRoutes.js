const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAnalytics,
  getAllUsers,
  updateUserStatus,
  getGuideApplications,
  getGuideApplicationById,
  approveGuideApplication,
  rejectGuideApplication,
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Analytics
router.get("/analytics", getAnalytics);

// User management
router.get("/users", getAllUsers);
router.put("/users/:userId/status", updateUserStatus);

// Guide application management (backed by Guide model)
router.get("/guide-applications", getGuideApplications);
router.get("/guide-applications/:id", getGuideApplicationById);
router.put("/guide-applications/:id/approve", approveGuideApplication);
router.put("/guide-applications/:id/reject", rejectGuideApplication);

module.exports = router;