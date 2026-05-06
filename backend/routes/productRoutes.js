const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, verifyRole } = require('../middleware/authMiddleware');

router.use(protect);

// All authenticated users can browse products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Only distributor can manage products
router.post('/', verifyRole('distributor'), createProduct);
router.put('/:id', verifyRole('distributor'), updateProduct);
router.delete('/:id', verifyRole('distributor'), deleteProduct);

module.exports = router;
