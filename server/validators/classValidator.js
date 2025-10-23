const { body } = require('express-validator');

// ✅ Validator khi tạo mới lớp học
exports.createClassValidator = [
    body('name')
        .notEmpty().withMessage('Tên lớp học không được để trống')
        .isLength({ min: 3, max: 255 }).withMessage('Tên lớp học phải từ 3–255 ký tự'),

    body('training_type_id')
        .notEmpty().withMessage('ID loại hình đào tạo không được để trống')
        .isInt({ min: 1 }).withMessage('ID loại hình đào tạo phải là số nguyên dương'),

    body('faculty_id')
        .notEmpty().withMessage('ID khoa không được để trống')
        .isInt({ min: 1 }).withMessage('ID khoa phải là số nguyên dương'),
];

// ✅ Validator khi cập nhật lớp học (optional fields)
exports.updateClassValidator = [
    body('name')
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage('Tên lớp học phải từ 3–255 ký tự'),

    body('training_type_id')
        .optional()
        .isInt({ min: 1 }).withMessage('ID loại hình đào tạo phải là số nguyên dương'),

    body('faculty_id')
        .optional()
        .isInt({ min: 1 }).withMessage('ID khoa phải là số nguyên dương'),
];
