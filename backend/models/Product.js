const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['cola', 'juice', 'water', 'energy_drink', 'sparkling', 'other'],
      default: 'other',
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    unitSize: {
      type: String, // e.g. "500ml", "1L", "2L", "24-pack"
      required: [true, 'Unit size is required'],
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 50,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false, // not active until warehouse manager approves
    },
    // Approval workflow: distributor adds → warehouse manager counts & approves
    approvalStatus: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected'],
      default: 'pending_approval',
    },
    approvalNote: {
      type: String,
      trim: true,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    // Currency is always ETB
    currency: {
      type: String,
      default: 'ETB',
    },
  },
  { timestamps: true }
);

// Virtual: check if stock is low
productSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.lowStockThreshold;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
