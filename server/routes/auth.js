const express = require('express');
const router = express.Router();
const { login, refreshToken, register, changePassword } = require('../controller/authController');
const { verifyToken } = require('../middleware/auth');

// Đăng nhập
router.post('/login', login);

// Refresh token
router.post('/refresh-token', refreshToken);

// Đăng ký user mới
router.post('/register', register);

// Change password for logged-in users
router.put('/change-password', verifyToken, changePassword);

module.exports = router;