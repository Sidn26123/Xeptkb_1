const { body } = require('express-validator');

exports.validateTeacher = [
    body('name')
        .notEmpty().withMessage('Tên giáo viên không được để trống')
        .isLength({ min: 3 }).withMessage('Tên giáo viên phải có ít nhất 3 ký tự'),
    // teacher_identifier replaces email as the required identifier for teachers
    body('teacher_identifier')
        .notEmpty().withMessage('Mã giáo viên không được để trống')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã giáo viên chỉ được chứa chữ, số, dấu gạch ngang hoặc gạch dưới')
        .isLength({ max: 50 }).withMessage('Mã giáo viên không được vượt quá 50 ký tự'),
    body('faculty_id')
        .notEmpty().withMessage('Vui lòng chọn khoa')
        .isNumeric().withMessage('Mã khoa phải là số'),
    body('phone')
        .optional()
        .isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
    // email_school is generated from identifier and should not be required from client
    body('email_school').optional().isEmail().withMessage('Email trường không hợp lệ'),
];
