const Product = require('../models/Product');
const User    = require('../models/User');
const { createNotification } = require('../utils/notificationService');

// @desc    Get all products
// @route   GET /api/products
// @access  All authenticated users
const getAllProducts = async (req, res, next) => {
  try {
    const { category, isActive, search, approvalStatus } = req.query;
    const filter = {};

    if (category) filter.category = category;

    // Retailers only see approved + active products
    if (req.user.role === 'retailer') {
      filter.isActive = true;
      filter.approvalStatus = 'approved';
    } else {
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (approvalStatus) filter.approvalStatus = approvalStatus;
    }

    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .populate('approvedBy', 'name role')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  All authenticated users
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('approvedBy', 'name role');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product (distributor adds → pending warehouse approval)
// @route   POST /api/products
// @access  Distributor only
const createProduct = async (req, res, next) => {
  try {
    // New products start as pending_approval and inactive until warehouse approves
    const product = await Product.create({
      ...req.body,
      approvalStatus: 'pending_approval',
      isActive: false,
    });

    // Notify all warehouse managers to count and approve
    const warehouseManagers = await User.find({ role: 'warehouse_manager', isActive: true }, '_id');
    if (warehouseManagers.length) {
      await createNotification(
        warehouseManagers.map((wm) => ({
          recipient: wm._id,
          type:      'product_pending',
          title:     'New Product Awaiting Count & Approval',
          message:   `Admin added "${product.name}" (${product.sku}). Please count the physical stock and approve it.`,
          link:      '/warehouse/approvals',
          meta:      { productId: product._id },
        }))
      );
    }

    res.status(201).json({
      success: true,
      message: 'Product created and sent to warehouse for count & approval.',
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Distributor only
const updateProduct = async (req, res, next) => {
  try {
    // Stock changes must go through stock routes
    delete req.body.stockQuantity;
    // Don't allow direct approval status change via this endpoint
    delete req.body.approvalStatus;
    delete req.body.approvedBy;
    delete req.body.approvedAt;

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Distributor only
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get products pending warehouse approval
// @route   GET /api/products/pending-approval
// @access  Warehouse Manager & Distributor
const getPendingApproval = async (req, res, next) => {
  try {
    const products = await Product.find({ approvalStatus: 'pending_approval' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// @desc    Warehouse manager approves a product (after physical count)
// @route   PATCH /api/products/:id/approve
// @access  Warehouse Manager only
const approveProduct = async (req, res, next) => {
  try {
    const { physicalCount, note } = req.body;

    if (physicalCount === undefined || physicalCount < 0) {
      return res.status(400).json({ success: false, message: 'Physical count is required and must be >= 0.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.approvalStatus !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Product is not pending approval.' });
    }

    product.stockQuantity  = Number(physicalCount);
    product.approvalStatus = 'approved';
    product.isActive       = true;
    product.approvedBy     = req.user._id;
    product.approvedAt     = new Date();
    product.approvalNote   = note || '';
    await product.save();

    // Notify all distributors
    const distributors = await User.find({ role: 'distributor', isActive: true }, '_id');
    if (distributors.length) {
      await createNotification(
        distributors.map((d) => ({
          recipient: d._id,
          type:      'product_approved',
          title:     'Product Approved & Live',
          message:   `"${product.name}" was counted (${physicalCount} units) and approved by ${req.user.name}. It is now available to retailers.`,
          link:      '/products/manage',
          meta:      { productId: product._id },
        }))
      );
    }

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" approved with ${physicalCount} units in stock.`,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Warehouse manager rejects a product
// @route   PATCH /api/products/:id/reject
// @access  Warehouse Manager only
const rejectProduct = async (req, res, next) => {
  try {
    const { note } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.approvalStatus !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Product is not pending approval.' });
    }

    product.approvalStatus = 'rejected';
    product.isActive       = false;
    product.approvedBy     = req.user._id;
    product.approvedAt     = new Date();
    product.approvalNote   = note || '';
    await product.save();

    // Notify all distributors
    const distributors = await User.find({ role: 'distributor', isActive: true }, '_id');
    if (distributors.length) {
      await createNotification(
        distributors.map((d) => ({
          recipient: d._id,
          type:      'product_rejected',
          title:     'Product Rejected by Warehouse',
          message:   `"${product.name}" was rejected by ${req.user.name}. Reason: ${note || 'No reason provided.'}`,
          link:      '/products/manage',
          meta:      { productId: product._id },
        }))
      );
    }

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" rejected.`,
      product,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPendingApproval,
  approveProduct,
  rejectProduct,
};
