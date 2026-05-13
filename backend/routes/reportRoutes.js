const express = require('express');
const router  = express.Router();
const {
  submitReport,
  getReports,
  getReportById,
  approveReport,
  rejectReport,
  getSalesSummary,
  getStockSummary,
} = require('../controllers/reportController');
const { protect, verifyRole } = require('../middleware/authMiddleware');

router.use(protect);

// Admin-only summary endpoints (must be before /:id)
router.get('/sales-summary', verifyRole('distributor'), getSalesSummary);
router.get('/stock-summary', verifyRole('distributor'), getStockSummary);

// Warehouse manager submits; both roles can list
router.post('/', verifyRole('warehouse_manager'), submitReport);
router.get('/',  verifyRole('distributor', 'warehouse_manager'), getReports);
router.get('/:id', verifyRole('distributor', 'warehouse_manager'), getReportById);

// Admin approves / rejects
router.patch('/:id/approve', verifyRole('distributor'), approveReport);
router.patch('/:id/reject',  verifyRole('distributor'), rejectReport);

module.exports = router;
