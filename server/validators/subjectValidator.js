const { body } = require('express-validator');

// ✅ Validator khi tạo mới môn học
exports.createSubjectValidator = [
    body('name')
        .notEmpty().withMessage('Tên môn học không được để trống')
        .isLength({ min: 3, max: 255 }).withMessage('Tên môn học phải từ 3–255 ký tự'),

    body('training_type_id')
        .notEmpty().withMessage('ID loại hình đào tạo không được để trống')
        .isInt({ min: 1 }).withMessage('ID loại hình đào tạo phải là số nguyên dương'),

    body('code')
        .notEmpty().withMessage('Mã môn học không được để trống')
        .isString().withMessage('Mã môn học phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã môn học tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã môn học chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),

    body('theory_hours')
        .optional()
        .isInt({ min: 0 }).withMessage('Số giờ lý thuyết phải là số nguyên không âm'),

    body('self_study_hours')
        .optional()
        .isInt({ min: 0 }).withMessage('Số giờ tự học phải là số nguyên không âm'),

    body('practice_hours')
        .optional()
        .isInt({ min: 0 }).withMessage('Số giờ thực hành phải là số nguyên không âm'),

    body('requires_lab')
        .optional()
        .isBoolean().withMessage('Giá trị yêu cầu phòng lab phải là true hoặc false'),
];

// ✅ Validator khi cập nhật môn học (optional fields)
exports.updateSubjectValidator = [
    body('name')
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage('Tên môn học phải từ 3–255 ký tự'),

    body('training_type_id')
        .optional()
        .isInt({ min: 1 }).withMessage('ID loại hình đào tạo phải là số nguyên dương'),

    body('code')
        .optional()
        .isString().withMessage('Mã môn học phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã môn học tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã môn học chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang'),

    body('theory_hours')
        .optional()
        .isInt({ min: 0 }).withMessage('Số giờ lý thuyết phải là số nguyên không âm'),

    body('self_study_hours')
        .optional()
        .isInt({ min: 0 }).withMessage('Số giờ tự học phải là số nguyên không âm'),

    body('practice_hours')
        .optional()
        .isInt({ min: 0 }).withMessage('Số giờ thực hành phải là số nguyên không âm'),

    body('requires_lab')
        .optional()
        .isBoolean().withMessage('Giá trị yêu cầu phòng lab phải là true hoặc false'),
];
