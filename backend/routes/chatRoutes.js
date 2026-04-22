const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMessages,
  sendMessage,
  getMyChats,
  getUnreadCount,
} = require('../controllers/chatController');

router.get('/my-chats',              protect, getMyChats);
router.get('/unread-count',          protect, getUnreadCount);
router.get('/booking/:bookingId',    protect, getMessages);
router.post('/booking/:bookingId',   protect, sendMessage);

module.exports = router;
