const express = require('express');
const router = express.Router();
const classController = require('../controller/classController');

// Lấy tất cả lớp học
router.get('/', classController.getAllClasses);

// Lấy lớp học theo id
router.get('/:id', classController.getClassById);

// Tạo lớp học mới
router.post('/', classController.createClass);

// Cập nhật lớp học
router.put('/:id', classController.updateClass);

// Xóa lớp học
router.delete('/:id', classController.deleteClass);

module.exports = router;