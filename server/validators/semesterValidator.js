const { body } = require('express-validator');

exports.createSemesterValidator = [
    body('AcademicYearsid')
        .notEmpty().withMessage('ID năm học không được để trống')
        .isInt({ min: 1 }).withMessage('ID năm học phải là số nguyên dương'),

    body('code')
        .notEmpty().withMessage('Mã học kỳ không được để trống')
        .isString().withMessage('Mã học kỳ phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã học kỳ tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã học kỳ chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),

    body('name')
        .notEmpty().withMessage('Tên học kỳ không được để trống')
        .isLength({ min: 3, max: 255 }).withMessage('Tên học kỳ phải từ 3–255 ký tự'),

    body('start')
        .notEmpty().withMessage('Ngày bắt đầu không được để trống')
        .isISO8601().withMessage('Ngày bắt đầu phải là ngày hợp lệ'),

    body('end')
        .notEmpty().withMessage('Ngày kết thúc không được để trống')
        .isISO8601().withMessage('Ngày kết thúc phải là ngày hợp lệ'),

    body('status')
        .optional()
        .isString().withMessage('Trạng thái phải là chuỗi'),
];

exports.updateSemesterValidator = [
    body('AcademicYearsid')
        .optional()
        .isInt({ min: 1 }).withMessage('ID năm học phải là số nguyên dương'),

    body('code')
        .optional()
        .isString().withMessage('Mã học kỳ phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã học kỳ tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã học kỳ chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),

    body('name')
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage('Tên học kỳ phải từ 3–255 ký tự'),

    body('start')
        .optional()
        .isISO8601().withMessage('Ngày bắt đầu phải là ngày hợp lệ'),

    body('end')
        .optional()
        .isISO8601().withMessage('Ngày kết thúc phải là ngày hợp lệ'),

    body('status')
        .optional()
        .isString().withMessage('Trạng thái phải là chuỗi'),
];
