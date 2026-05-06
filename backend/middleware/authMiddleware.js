const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies the JWT token and attaches the user to req.user
 * Use on any route that requires authentication.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach fresh user from DB (so deactivated accounts are caught)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact the distributor.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token is invalid or expired.',
    });
  }
};

/**
 * verifyRole — restricts access to specific roles.
 * Usage: verifyRole('distributor', 'warehouse_manager')
 *
 * Roles available:
 *   distributor         → Admin, full access
 *   warehouse_manager   → Stock in/out
 *   retailer            → Browse catalog, place orders
 *   delivery_personnel  → View & update assigned deliveries
 */
const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { protect, verifyRole };
