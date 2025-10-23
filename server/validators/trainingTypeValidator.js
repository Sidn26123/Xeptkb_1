const { body } = require('express-validator');

exports.createTrainingTypeValidator = [
    body('code')
        .notEmpty().withMessage('Mã loại hình đào tạo không được để trống')
        .isString().withMessage('Mã loại hình đào tạo phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã loại hình đào tạo tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã loại hình đào tạo chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),

    body('name')
        .notEmpty().withMessage('Tên loại hình đào tạo không được để trống')
        .isLength({ min: 3, max: 255 }).withMessage('Tên loại hình đào tạo phải từ 3–255 ký tự'),

    body('description')
        .optional()
        .isString().withMessage('Mô tả phải là chuỗi'),
];

exports.updateTrainingTypeValidator = [
    body('code')
        .optional()
        .isString().withMessage('Mã loại hình đào tạo phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã loại hình đào tạo tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã loại hình đào tạo chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),

    body('name')
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage('Tên loại hình đào tạo phải từ 3–255 ký tự'),

    body('description')
        .optional()
        .isString().withMessage('Mô tả phải là chuỗi'),
];
