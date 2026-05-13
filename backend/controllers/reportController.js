const Report  = require('../models/Report');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const User    = require('../models/User');
const { createNotification } = require('../utils/notificationService');

// ─── Helper: format ETB ───────────────────────────────────────────────────────
const etb = (n) => `ETB ${Number(n).toLocaleString('en-ET', { minimumFractionDigits: 2 })}`;

// @desc    Warehouse manager submits a daily or weekly report
// @route   POST /api/reports
// @access  Warehouse Manager only
const submitReport = async (req, res, next) => {
  try {
    const { type, periodStart, periodEnd, notes } = req.body;

    if (!type || !periodStart || !periodEnd) {
      return res.status(400).json({ success: false, message: 'type, periodStart, and periodEnd are required.' });
    }

    const start = new Date(periodStart);
    const end   = new Date(periodEnd);
    end.setHours(23, 59, 59, 999);

    // Auto-build report items from StockLog + Orders in the period
    const products = await Product.find({ approvalStatus: 'approved' });

    const items = [];
    let totalStockIn   = 0;
    let totalStockOut  = 0;
    let totalUnitsSold = 0;
    let totalRevenueETB = 0;

    for (const product of products) {
      const logs = await StockLog.find({
        product: product._id,
        createdAt: { $gte: start, $lte: end },
      });

      const stockInQty  = logs.filter((l) => l.type === 'stock_in').reduce((s, l) => s + l.quantity, 0);
      const stockOutQty = logs.filter((l) => l.type === 'stock_out').reduce((s, l) => s + l.quantity, 0);

      // Units sold = stock_out entries linked to orders
      const orderLogs = logs.filter((l) => l.type === 'stock_out' && l.relatedOrder);
      const unitsSold = orderLogs.reduce((s, l) => s + l.quantity, 0);
      const revenueETB = unitsSold * product.pricePerUnit;

      // Opening stock = current stock - net movement in period
      const openingStock = Math.max(0, product.stockQuantity - stockInQty + stockOutQty);

      if (stockInQty > 0 || stockOutQty > 0 || unitsSold > 0) {
        items.push({
          product:      product._id,
          openingStock,
          closingStock: product.stockQuantity,
          stockIn:      stockInQty,
          stockOut:     stockOutQty,
          unitsSold,
          revenueETB,
        });

        totalStockIn    += stockInQty;
        totalStockOut   += stockOutQty;
        totalUnitsSold  += unitsSold;
        totalRevenueETB += revenueETB;
      }
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No stock movements found in the selected period. Nothing to report.',
      });
    }

    const report = await Report.create({
      type,
      periodStart: start,
      periodEnd:   end,
      submittedBy: req.user._id,
      items,
      totalStockIn,
      totalStockOut,
      totalUnitsSold,
      totalRevenueETB,
      notes: notes || '',
    });

    // Notify all distributors
    const distributors = await User.find({ role: 'distributor', isActive: true }, '_id');
    if (distributors.length) {
      await createNotification(
        distributors.map((d) => ({
          recipient: d._id,
          type:      'report_submitted',
          title:     `${type === 'daily' ? 'Daily' : 'Weekly'} Report Submitted`,
          message:   `${req.user.name} submitted ${report.reportNumber}. Total revenue: ${etb(totalRevenueETB)}. Awaiting your approval.`,
          link:      '/reports',
          meta:      { reportId: report._id },
        }))
      );
    }

    const populated = await Report.findById(report._id)
      .populate('submittedBy', 'name role')
      .populate('items.product', 'name sku pricePerUnit');

    res.status(201).json({ success: true, report: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reports (distributor sees all; warehouse sees own)
// @route   GET /api/reports
// @access  Distributor & Warehouse Manager
const getReports = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const filter = {};

    if (req.user.role === 'warehouse_manager') {
      filter.submittedBy = req.user._id;
    }
    if (type)   filter.type   = type;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('submittedBy', 'name role')
      .populate('reviewedBy',  'name role')
      .populate('items.product', 'name sku pricePerUnit')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Distributor & Warehouse Manager (own)
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('submittedBy', 'name role email')
      .populate('reviewedBy',  'name role')
      .populate('items.product', 'name sku pricePerUnit unitSize');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Warehouse managers can only view their own reports
    if (
      req.user.role === 'warehouse_manager' &&
      report.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin approves a report
// @route   PATCH /api/reports/:id/approve
// @access  Distributor only
const approveReport = async (req, res, next) => {
  try {
    const { reviewNote } = req.body;

    const report = await Report.findById(req.params.id).populate('submittedBy', '_id name');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    if (report.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Report has already been reviewed.' });
    }

    report.status     = 'approved';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    report.reviewNote = reviewNote || '';
    await report.save();

    // Notify the warehouse manager who submitted it
    await createNotification({
      recipient: report.submittedBy._id,
      type:      'report_approved',
      title:     'Your Report Was Approved',
      message:   `${report.reportNumber} has been approved by ${req.user.name}.${reviewNote ? ' Note: ' + reviewNote : ''}`,
      link:      '/reports',
      meta:      { reportId: report._id },
    });

    res.status(200).json({ success: true, message: 'Report approved.', report });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin rejects a report
// @route   PATCH /api/reports/:id/reject
// @access  Distributor only
const rejectReport = async (req, res, next) => {
  try {
    const { reviewNote } = req.body;

    const report = await Report.findById(req.params.id).populate('submittedBy', '_id name');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    if (report.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Report has already been reviewed.' });
    }

    report.status     = 'rejected';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    report.reviewNote = reviewNote || 'No reason provided.';
    await report.save();

    await createNotification({
      recipient: report.submittedBy._id,
      type:      'report_rejected',
      title:     'Your Report Was Rejected',
      message:   `${report.reportNumber} was rejected by ${req.user.name}. Reason: ${report.reviewNote}`,
      link:      '/reports',
      meta:      { reportId: report._id },
    });

    res.status(200).json({ success: true, message: 'Report rejected.', report });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: get sales report summary (for admin reports page)
// @route   GET /api/reports/sales-summary
// @access  Distributor only
const getSalesSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end   = to   ? new Date(to)   : new Date();
    end.setHours(23, 59, 59, 999);

    // Revenue from delivered orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } },
    ]);

    // Revenue by product
    const productRevenue = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id:         '$items.product',
          unitsSold:   { $sum: '$items.quantity' },
          revenueETB:  { $sum: { $multiply: ['$items.quantity', '$items.priceAtOrder'] } },
        },
      },
      { $sort: { revenueETB: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from:         'products',
          localField:   '_id',
          foreignField: '_id',
          as:           'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          name:       '$product.name',
          sku:        '$product.sku',
          unitsSold:  1,
          revenueETB: 1,
        },
      },
    ]);

    // Orders by status in period
    const ordersByStatus = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Daily revenue trend (last 30 days)
    const dailyRevenue = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenueETB: { $sum: '$totalAmount' },
          orders:     { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue:  revenueAgg[0]?.totalRevenue  || 0,
        totalOrders:   revenueAgg[0]?.totalOrders   || 0,
        productRevenue,
        ordersByStatus,
        dailyRevenue,
        periodStart: start,
        periodEnd:   end,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: get stock report summary
// @route   GET /api/reports/stock-summary
// @access  Distributor only
const getStockSummary = async (req, res, next) => {
  try {
    const products = await Product.find({ approvalStatus: 'approved' })
      .sort({ stockQuantity: 1 });

    const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);

    const totalStockValue = products.reduce(
      (sum, p) => sum + p.stockQuantity * p.pricePerUnit,
      0
    );

    // Recent stock movements (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = await require('../models/StockLog').find({
      createdAt: { $gte: sevenDaysAgo },
    })
      .populate('product', 'name sku')
      .populate('performedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      summary: {
        totalProducts:    products.length,
        lowStockCount:    lowStock.length,
        totalStockValue,
        products,
        lowStock,
        recentLogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitReport,
  getReports,
  getReportById,
  approveReport,
  rejectReport,
  getSalesSummary,
  getStockSummary,
};
