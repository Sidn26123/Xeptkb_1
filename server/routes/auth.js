const express = require('express');
const router = express.Router();
const { login, refreshToken, register } = require('../controller/authController');

// Đăng nhập
router.post('/login', login);

// Refresh token
router.post('/refresh-token', refreshToken);

// Đăng ký user mới
router.post('/register', register);

module.exports = router;