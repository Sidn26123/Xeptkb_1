// middleware/errorHandler.js

const AppError = require('../utils/AppError');

// Helper: Xử lý lỗi Mongoose Cast Error (ID không hợp lệ)
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// Helper: Xử lý lỗi Mongoose Duplicate Key
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

// Helper: Xử lý lỗi Mongoose Validation
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// Helper: Xử lý lỗi JWT Token không hợp lệ
const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

// Helper: Xử lý lỗi JWT Token hết hạn
const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

// Gửi lỗi chi tiết trong môi trường development
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Gửi lỗi đơn giản trong môi trường production
const sendErrorProd = (err, res) => {
    // Lỗi operational, tin cậy: gửi message cho client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Lỗi programming hoặc unknown: không leak thông tin
    else {
        // 1) Log lỗi
        console.error('ERROR 💥', err);

        // 2) Gửi message chung chung
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

// Main Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        error.name = err.name;

        // Xử lý các loại lỗi cụ thể
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

module.exports = errorHandler;