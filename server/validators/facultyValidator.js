const { body } = require('express-validator');

exports.validateFaculty = [
    body('name')
        .notEmpty().withMessage('Tên khoa không được để trống')
        .isLength({ min: 3, max: 255 }).withMessage('Tên khoa phải từ 3–255 ký tự'),

    body('faculty_id')
        .notEmpty().withMessage('Mã khoa không được để trống')
        .isString().withMessage('Mã khoa phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã khoa tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã khoa chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),
];

exports.createFacultyValidator = [
    body('name')
        .notEmpty().withMessage('Tên khoa không được để trống')
        .isLength({ min: 3, max: 255 }).withMessage('Tên khoa phải từ 3–255 ký tự'),

    body('faculty_id')
        .notEmpty().withMessage('Mã khoa không được để trống')
        .isString().withMessage('Mã khoa phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã khoa tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã khoa chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),
];

// ✅ Validator khi cập nhật (chỉ check nếu có field)
exports.updateFacultyValidator = [
    body('name')
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage('Tên khoa phải từ 3–255 ký tự'),

    body('faculty_id')
        .optional()
        .isString().withMessage('Mã khoa phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã khoa tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã khoa chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),
];
