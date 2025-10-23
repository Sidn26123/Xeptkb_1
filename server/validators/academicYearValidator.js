const { body } = require('express-validator');

exports.createAcademicYearValidator = [
    body('year_code')
        .notEmpty().withMessage('Mã năm học không được để trống')
        .isString().withMessage('Mã năm học phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã năm học tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã năm học chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),

    body('start_date')
        .notEmpty().withMessage('Ngày bắt đầu không được để trống')
        .isISO8601().withMessage('Ngày bắt đầu phải là ngày hợp lệ'),

    body('end_date')
        .notEmpty().withMessage('Ngày kết thúc không được để trống')
        .isISO8601().withMessage('Ngày kết thúc phải là ngày hợp lệ'),

    body('status')
        .optional()
        .isString().withMessage('Trạng thái phải là chuỗi'),
];

exports.updateAcademicYearValidator = [
    body('year_code')
        .optional()
        .isString().withMessage('Mã năm học phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã năm học tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã năm học chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),

    body('start_date')
        .optional()
        .isISO8601().withMessage('Ngày bắt đầu phải là ngày hợp lệ'),

    body('end_date')
        .optional()
        .isISO8601().withMessage('Ngày kết thúc phải là ngày hợp lệ'),

    body('status')
        .optional()
        .isString().withMessage('Trạng thái phải là chuỗi'),
];
