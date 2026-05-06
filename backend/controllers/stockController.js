const Product = require('../models/Product');
const StockLog = require('../models/StockLog');

// @desc    Stock In — add stock to a product
// @route   POST /api/stock/in
// @access  Warehouse Manager & Distributor
const stockIn = async (req, res, next) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Product ID and a valid quantity are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const previousStock = product.stockQuantity;
    product.stockQuantity += Number(quantity);
    await product.save();

    const log = await StockLog.create({
      product: product._id,
      type: 'stock_in',
      quantity,
      previousStock,
      newStock: product.stockQuantity,
      performedBy: req.user._id,
      reason: reason || 'Manual stock in',
    });

    res.status(200).json({
      success: true,
      message: `Added ${quantity} units to "${product.name}".`,
      product,
      log,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Stock Out — remove stock manually (not via order)
// @route   POST /api/stock/out
// @access  Warehouse Manager & Distributor
const stockOut = async (req, res, next) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Product ID and a valid quantity are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stockQuantity} units.`,
      });
    }

    const previousStock = product.stockQuantity;
    product.stockQuantity -= Number(quantity);
    await product.save();

    const log = await StockLog.create({
      product: product._id,
      type: 'stock_out',
      quantity,
      previousStock,
      newStock: product.stockQuantity,
      performedBy: req.user._id,
      reason: reason || 'Manual stock out',
    });

    res.status(200).json({
      success: true,
      message: `Removed ${quantity} units from "${product.name}".`,
      product,
      log,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get stock logs
// @route   GET /api/stock/logs
// @access  Warehouse Manager & Distributor
const getStockLogs = async (req, res, next) => {
  try {
    const { productId, type } = req.query;
    const filter = {};
    if (productId) filter.product = productId;
    if (type) filter.type = type;

    const logs = await StockLog.find(filter)
      .populate('product', 'name sku')
      .populate('performedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};

// @desc    Get low stock products
// @route   GET /api/stock/low
// @access  Warehouse Manager & Distributor
const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
      isActive: true,
    });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

module.exports = { stockIn, stockOut, getStockLogs, getLowStockProducts };
