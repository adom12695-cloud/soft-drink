const express = require('express');
const router = express.Router();
const {
  stockIn,
  stockOut,
  getStockLogs,
  getLowStockProducts,
} = require('../controllers/stockController');
const { protect, verifyRole } = require('../middleware/authMiddleware');

router.use(protect);

const warehouseRoles = ['warehouse_manager', 'distributor'];

router.post('/in', verifyRole(...warehouseRoles), stockIn);
router.post('/out', verifyRole(...warehouseRoles), stockOut);
router.get('/logs', verifyRole(...warehouseRoles), getStockLogs);
router.get('/low', verifyRole(...warehouseRoles), getLowStockProducts);

module.exports = router;
