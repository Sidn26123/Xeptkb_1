const express = require('express');
const router = express.Router();
const studentsiteController = require('../controller/studentsiteController');
const { verifyToken, authorize } = require('../middleware/auth');

// Endpoint dành cho studentsite: trả hồ sơ sinh viên đang đăng nhập
// Yêu cầu xác thực token và role student (admin cũng được quyền xem)
router.get('/profile', verifyToken, authorize('student', 'admin'), studentsiteController.getProfile);
// Allow students to update their own contact info (address, email_personal)
router.put('/profile', verifyToken, authorize('student', 'admin'), studentsiteController.updateProfile);
// Note: change-password is handled centrally in /auth/change-password

module.exports = router;
