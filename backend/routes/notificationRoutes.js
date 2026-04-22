const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');

router.get('/',                protect, getMyNotifications);
router.get('/unread-count',    protect, getUnreadCount);
router.put('/read-all',        protect, markAllRead);
router.put('/:id/read',        protect, markRead);
router.delete('/:id',          protect, deleteNotification);

module.exports = router;
