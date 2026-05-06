const express = require('express');
const router  = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get ('/',                 getNotifications);
router.get ('/unread-count',     getUnreadCount);
router.patch('/read-all',        markAllAsRead);
router.patch('/:id/read',        markAsRead);
router.delete('/',               deleteAllNotifications);
router.delete('/:id',            deleteNotification);

module.exports = router;
