const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const { sendPasswordResetCode } = require('../utils/emailService');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:            user._id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      phone:          user.phone,
      address:        user.address,
      bio:            user.bio,
      avatar:         user.avatar,
      profilePicture: user.profilePicture,
      createdAt:      user.createdAt,
    },
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const user = await User.create({ name, email, password, role, phone, address });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact the distributor.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// ─── Update Profile ───────────────────────────────────────────────────────────
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    // Fields the user is allowed to update on themselves
    const allowed = ['name', 'phone', 'address', 'bio', 'avatar'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id:     user._id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        phone:   user.phone,
        address: user.address,
        bio:     user.bio,
        avatar:  user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @access  Private (must know current password)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password.',
      });
    }

    // Re-fetch with password (it's excluded by default)
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    // Issue a fresh token so existing sessions are effectively invalidated
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── Upload Avatar ────────────────────────────────────────────────────────────
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fs   = require('fs');
    const path = require('path');

    // Delete old avatar file if it exists and is a local upload
    const oldUser = await User.findById(req.user._id);
    if (oldUser.profilePicture && oldUser.profilePicture.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../', oldUser.profilePicture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Save the relative URL path
    const profilePicture = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated.',
      profilePicture: user.profilePicture,
      user: {
        _id:            user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        phone:          user.phone,
        address:        user.address,
        bio:            user.bio,
        avatar:         user.avatar,
        profilePicture: user.profilePicture,
        createdAt:      user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Remove Avatar ────────────────────────────────────────────────────────────
// @route   DELETE /api/auth/remove-avatar
// @access  Private
const removeAvatar = async (req, res, next) => {
  try {
    const fs   = require('fs');
    const path = require('path');

    const oldUser = await User.findById(req.user._id);
    if (oldUser.profilePicture && oldUser.profilePicture.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../', oldUser.profilePicture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: '' },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture removed.',
      user: {
        _id:            user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        phone:          user.phone,
        address:        user.address,
        bio:            user.bio,
        avatar:         user.avatar,
        profilePicture: user.profilePicture,
        createdAt:      user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
// @route   POST /api/auth/forgot-password
// @access  Public
// Generates a 6-digit OTP and emails it to the user.
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });

    // Always return 200 — prevents email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset code has been sent.',
      });
    }

    // Generate OTP and save hashed version to DB
    const otp = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send OTP via email
    try {
      await sendPasswordResetCode({
        to:   user.email,
        name: user.name,
        code: otp,
      });
    } catch (emailErr) {
      // Roll back the token if email fails so user can retry
      user.passwordResetToken   = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email send error:', emailErr.message);
      return res.status(503).json({
        success: false,
        message: 'Email service is currently unavailable. Please contact the administrator or try again later.',
      });
    }

    res.status(200).json({
      success: true,
      message: `A 6-digit reset code has been sent to ${user.email}. It expires in 15 minutes.`,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
// @route   POST /api/auth/reset-password
// @access  Public — user submits email + OTP code + new password together
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset code, and new password are all required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    // Hash the submitted OTP to compare with stored hash
    const hashedCode = crypto
      .createHash('sha256')
      .update(code.trim())
      .digest('hex');

    const user = await User.findOne({
      email:                email.toLowerCase().trim(),
      passwordResetToken:   hashedCode,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The code is invalid or has expired. Please request a new one.',
      });
    }

    // Set new password and clear reset fields
    user.password             = newPassword;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in immediately with a fresh JWT
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  removeAvatar,
};
