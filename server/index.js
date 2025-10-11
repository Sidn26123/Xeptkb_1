// Express server setup with required middleware and error handling

require('dotenv').config();
const express = require('express');
const cors = require('./config/cors');
const compression = require('compression');
const session = require('express-session');
const { db } = require('./config/db');

const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const authRoutes = require('./routes/auth');
const app = express();
app.use(express.json());
app.use(cors);

app.use(compression());

// API routes
app.use('/api/', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

// 404 handler for unknown routes
const ErrorResponse = require('./utils/errorResponse');
app.use((req, res, next) => {
  // Forward to the global error handler with a 404 error
  const error = new ErrorResponse('Route not found', 404);
  next(error);
});

// Global Error Handler - MUST be last middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler Caught:', err.stack);
  let error = { ...err }; // Clone error to avoid modifying original
  error.message = err.message;

  // bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400); // Set status code to 400
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route (Invalid Token)';
    error = new ErrorResponse(message, 401);
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Not authorized to access this route (Token Expired)';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});