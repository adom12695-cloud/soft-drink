const mongoose = require('mongoose');

const reportItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  openingStock: { type: Number, required: true, min: 0 },
  closingStock:  { type: Number, required: true, min: 0 },
  stockIn:       { type: Number, default: 0, min: 0 },
  stockOut:      { type: Number, default: 0, min: 0 },
  unitsSold:     { type: Number, default: 0, min: 0 },
  revenueETB:    { type: Number, default: 0, min: 0 },
});

const reportSchema = new mongoose.Schema(
  {
    reportNumber: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [reportItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Report must include at least one product.',
      },
    },
    totalStockIn:   { type: Number, default: 0 },
    totalStockOut:  { type: Number, default: 0 },
    totalUnitsSold: { type: Number, default: 0 },
    totalRevenueETB:{ type: Number, default: 0 },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-generate report number
reportSchema.pre('save', async function (next) {
  if (!this.reportNumber) {
    const count = await mongoose.model('Report').countDocuments();
    const prefix = this.type === 'daily' ? 'RPT-D' : 'RPT-W';
    this.reportNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);
