const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAnalytics,
  getAllUsers,
  updateUserStatus
} = require("../controllers/adminController");

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Analytics routes
router.get("/analytics", getAnalytics);

// User management routes
router.get("/users", getAllUsers);
router.put("/users/:userId/status", updateUserStatus);

module.exports = router;










