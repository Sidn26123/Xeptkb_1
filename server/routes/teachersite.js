const express = require('express');
const router = express.Router();
const teachersiteController = require('../controller/teachersiteController');
const { verifyToken, authorize } = require('../middleware/auth');

// Endpoint dành cho teachersite: trả hồ sơ giảng viên đang đăng nhập
// Yêu cầu xác thực token và role teacher (admin cũng được quyền xem)
router.get('/profile', verifyToken, authorize('teacher', 'admin'), teachersiteController.getProfile);
// Allow teachers to update their own contact info (address, email_personal)
router.put('/profile', verifyToken, authorize('teacher', 'admin'), teachersiteController.updateProfile);

module.exports = router;
