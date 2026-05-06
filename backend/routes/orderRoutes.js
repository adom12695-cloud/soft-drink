const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrders,
  getOrderById,
  assignDelivery,
  updateOrderStatus,
  getAnalytics,
} = require('../controllers/orderController');
const { protect, verifyRole } = require('../middleware/authMiddleware');

router.use(protect);

// Analytics — distributor only (must be before /:id to avoid route conflict)
router.get('/analytics', verifyRole('distributor'), getAnalytics);

// All authenticated users (filtered by role in controller)
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Retailer places orders
router.post('/', verifyRole('retailer'), placeOrder);

// Distributor assigns delivery
router.patch('/:id/assign', verifyRole('distributor'), assignDelivery);

// Delivery personnel & distributor update status
router.patch(
  '/:id/status',
  verifyRole('delivery_personnel', 'distributor'),
  updateOrderStatus
);

module.exports = router;
