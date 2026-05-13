const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPendingApproval,
  approveProduct,
  rejectProduct,
} = require('../controllers/productController');
const { protect, verifyRole } = require('../middleware/authMiddleware');

router.use(protect);

// Pending approval list — warehouse manager & distributor
router.get('/pending-approval', verifyRole('warehouse_manager', 'distributor'), getPendingApproval);

// All authenticated users can browse products (filtered by role in controller)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Only distributor can create / update / delete
router.post('/', verifyRole('distributor'), createProduct);
router.put('/:id', verifyRole('distributor'), updateProduct);
router.delete('/:id', verifyRole('distributor'), deleteProduct);

// Warehouse manager approves or rejects a pending product
router.patch('/:id/approve', verifyRole('warehouse_manager'), approveProduct);
router.patch('/:id/reject',  verifyRole('warehouse_manager'), rejectProduct);

module.exports = router;
