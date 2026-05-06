const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_placed',       // retailer placed an order
        'order_confirmed',    // distributor confirmed an order
        'order_dispatched',   // delivery personnel dispatched
        'order_delivered',    // order delivered
        'order_cancelled',    // order cancelled
        'stock_low',          // product below threshold
        'stock_in',           // warehouse added stock
        'stock_out',          // warehouse removed stock
        'user_created',       // new user registered
        'system',             // generic system message
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,   // frontend route to navigate to on click
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed, // extra data (orderId, productId, etc.)
      default: {},
    },
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
