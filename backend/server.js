const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const dns      = require('node:dns/promises');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const { verifyEmailConfig }  = require('./utils/emailService');
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const productRoutes      = require('./routes/productRoutes');
const orderRoutes        = require('./routes/orderRoutes');
const stockRoutes        = require('./routes/stockRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Serve uploaded avatars as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/stock',         stockRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    verifyEmailConfig(); // check SMTP on startup
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
