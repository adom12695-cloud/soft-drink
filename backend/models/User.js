const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return password in queries by default
    },
    role: {
      type: String,
      enum: ['distributor', 'warehouse_manager', 'retailer', 'delivery_personnel'],
      default: 'retailer',
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,   // initials-based color key
      default: 'indigo',
    },
    profilePicture: {
      type: String,   // URL path to uploaded image e.g. /uploads/avatars/xxx.jpg
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate a plain-text reset token, store its hash on the document
userSchema.methods.createPasswordResetToken = function () {
  const crypto = require('crypto');

  // Generate a 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store SHA-256 hash — never store plain OTP in DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Valid for 15 minutes
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

  return otp; // return plain OTP to send via email
};

module.exports = mongoose.model('User', userSchema);
