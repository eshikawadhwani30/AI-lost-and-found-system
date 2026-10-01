const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const fs = require('fs');

// Custom Middlewares & Routes
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const {
  securityHeaders,
  mongoSanitize,
  xssSanitize,
  generalLimiter,
} = require('./middleware/securityMiddleware');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load environment variables from .env file
dotenv.config();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Initialize Express application
const app = express();

// Disable x-powered-by header (prevents server fingerprinting)
app.disable('x-powered-by');

// Connect to MongoDB
connectDB();

// -------------------------------------------------------------
// Core Middlewares
// -------------------------------------------------------------

// 1. Enterprise Security Headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
app.use(securityHeaders);

// 2. CORS: Allow requests from the frontend client application
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Request body parsers (JSON & URL-encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Input Sanitization (Blocks NoSQL $ operator injection and XSS tags)
app.use(mongoSanitize);
app.use(xssSanitize);

// 6. Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------------------------------------------------
// Base & Health Check Routes
// -------------------------------------------------------------

// Root API Greeting
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the AI-Based Lost & Found Management System API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// System Health Check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    success: true,
    message: 'Lost & Found API is healthy and operational',
    data: {
      status: 'UP',
      uptime: `${Math.floor(process.uptime())} seconds`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown',
      },
    },
  });
});

// -------------------------------------------------------------
// Registered Application Routes
// -------------------------------------------------------------
// Apply Global Anti-DDoS Rate Limiter to all /api endpoints
app.use('/api', generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// -------------------------------------------------------------
// Production Static Frontend Hosting (Single-Origin Deployment)
// -------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    // Exclude API routes from static fallback
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// -------------------------------------------------------------
// Error Handling Middlewares (Must be registered last)
// -------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Lost & Found Backend Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📦 Item Endpoints: http://localhost:${PORT}/api/items`);
  console.log(`⚖️ Claim Endpoints: http://localhost:${PORT}/api/claims`);
  console.log(`🛡️ Admin Endpoints: http://localhost:${PORT}/api/admin`);
  console.log(`🤖 Gemini AI Endpoints: http://localhost:${PORT}/api/ai/match`);
  console.log(`📂 Categories Endpoint: http://localhost:${PORT}/api/categories`);
  console.log(`🔒 Production Hardening Active:`);
  console.log(`   ✓ HTTP Security Headers (CSP, HSTS, X-Frame, X-Content-Type)`);
  console.log(`   ✓ NoSQL Operator Sanitization ($gt, $ne, dot-notation blocked)`);
  console.log(`   ✓ Cross-Site Scripting (XSS) input filtering`);
  console.log(`   ✓ Sliding-Window Rate Limiting (Global, Auth, & AI)`);
  console.log(`   ✓ Zero Fingerprint: X-Powered-By disabled`);
  console.log(`===================================================`);
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] Error: ${err.message}`);
  server.close(() => process.exit(1));
});
