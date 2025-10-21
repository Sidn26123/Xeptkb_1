const { body } = require('express-validator');

exports.validateTeacher = [
    body('name')
        .notEmpty().withMessage('Tên giáo viên không được để trống')
        .isLength({ min: 3 }).withMessage('Tên giáo viên phải có ít nhất 3 ký tự'),
    body('email')
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ'),
    body('faculty_id')
        .optional()
        .isNumeric().withMessage('Mã khoa phải là số'),
    body('phone')
        .optional()
        .isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
];
