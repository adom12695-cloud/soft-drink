const express  = require('express');
const router   = express.Router();
const {
  register, login, getMe,
  updateProfile, changePassword,
  forgotPassword, resetPassword,
  uploadAvatar, removeAvatar,
} = require('../controllers/authController');
const { protect }  = require('../middleware/authMiddleware');
const upload       = require('../middleware/uploadMiddleware');

// Public
router.post('/register',            register);
router.post('/login',               login);
router.post('/forgot-password',     forgotPassword);
router.post('/reset-password',      resetPassword);

// Private
router.get ('/me',                  protect, getMe);
router.put ('/update-profile',      protect, updateProfile);
router.put ('/change-password',     protect, changePassword);
router.post('/upload-avatar',       protect, upload.single('avatar'), uploadAvatar);
router.delete('/remove-avatar',     protect, removeAvatar);

module.exports = router;
