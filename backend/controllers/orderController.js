const Order   = require('../models/Order');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const User    = require('../models/User');
const { createNotification } = require('../utils/notificationService');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Retailer only
const placeOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found.` });
      }
      if (!product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${product.name}" is no longer available.` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}.`,
        });
      }

      enrichedItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtOrder: product.pricePerUnit,
      });

      totalAmount += product.pricePerUnit * item.quantity;
    }

    const order = await Order.create({
      retailer: req.user._id,
      items: enrichedItems,
      totalAmount,
      deliveryAddress,
      notes,
    });

    // Deduct stock for each item
    for (const item of enrichedItems) {
      const product = await Product.findById(item.product);
      const previousStock = product.stockQuantity;
      product.stockQuantity -= item.quantity;
      await product.save();

      await StockLog.create({
        product: item.product,
        type: 'stock_out',
        quantity: item.quantity,
        previousStock,
        newStock: product.stockQuantity,
        performedBy: req.user._id,
        reason: `Order ${order.orderNumber}`,
        relatedOrder: order._id,
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('retailer', 'name email')
      .populate('items.product', 'name sku pricePerUnit');

    // Notify all distributors about the new order
    const distributors = await User.find({ role: 'distributor', isActive: true }, '_id');
    if (distributors.length) {
      await createNotification(distributors.map((d) => ({
        recipient: d._id,
        type:      'order_placed',
        title:     'New Order Received',
        message:   `${req.user.name} placed order ${order.orderNumber} for $${order.totalAmount.toFixed(2)}.`,
        link:      '/orders',
        meta:      { orderId: order._id },
      })));
    }

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (distributor sees all; retailer sees own; delivery sees assigned)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (req.user.role === 'retailer') {
      filter.retailer = req.user._id;
    } else if (req.user.role === 'delivery_personnel') {
      filter.deliveryPersonnel = req.user._id;
    }

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('retailer', 'name email phone')
      .populate('deliveryPersonnel', 'name phone')
      .populate('items.product', 'name sku unitSize')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('retailer', 'name email phone address')
      .populate('deliveryPersonnel', 'name phone')
      .populate('items.product', 'name sku unitSize imageUrl');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Retailers can only view their own orders
    if (req.user.role === 'retailer' && order.retailer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign delivery personnel to an order
// @route   PATCH /api/orders/:id/assign
// @access  Distributor only
const assignDelivery = async (req, res, next) => {
  try {
    const { deliveryPersonnelId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPersonnel: deliveryPersonnelId, status: 'confirmed' },
      { new: true, runValidators: true }
    ).populate('deliveryPersonnel', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Notify the assigned delivery person
    await createNotification({
      recipient: deliveryPersonnelId,
      type:      'order_confirmed',
      title:     'New Delivery Assigned',
      message:   `Order ${order.orderNumber} has been assigned to you for delivery.`,
      link:      '/deliveries',
      meta:      { orderId: order._id },
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (delivery personnel updates dispatched/delivered)
// @route   PATCH /api/orders/:id/status
// @access  Delivery Personnel & Distributor
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['dispatched', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}.`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Delivery personnel can only update their own assigned orders
    if (
      req.user.role === 'delivery_personnel' &&
      order.deliveryPersonnel?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'This order is not assigned to you.' });
    }

    order.status = status;
    await order.save();

    // Fire notification based on new status
    const notifMap = {
      dispatched: {
        recipient: order.retailer,
        type:      'order_dispatched',
        title:     'Order Dispatched',
        message:   `Your order ${order.orderNumber} is on its way!`,
        link:      '/orders',
      },
      delivered: {
        recipient: order.retailer,
        type:      'order_delivered',
        title:     'Order Delivered',
        message:   `Your order ${order.orderNumber} has been delivered.`,
        link:      '/orders',
      },
      cancelled: {
        recipient: order.retailer,
        type:      'order_cancelled',
        title:     'Order Cancelled',
        message:   `Order ${order.orderNumber} has been cancelled.`,
        link:      '/orders',
      },
    };
    if (notifMap[status]) {
      await createNotification({ ...notifMap[status], meta: { orderId: order._id } });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get analytics summary
// @route   GET /api/orders/analytics
// @access  Distributor only
const getAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentOrders = await Order.find()
      .populate('retailer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getOrders, getOrderById, assignDelivery, updateOrderStatus, getAnalytics };
