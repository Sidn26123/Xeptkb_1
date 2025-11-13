const { body } = require('express-validator');
const { Student } = require('../models');
const { Op } = require('sequelize');

// ✅ Validator khi tạo mới sinh viên
exports.createStudentValidator = [
    body('class_id')
        .notEmpty().withMessage('ID lớp học không được để trống')
        .isInt({ min: 1 }).withMessage('ID lớp học phải là số nguyên dương'),

    body('name')
        .notEmpty().withMessage('Tên sinh viên không được để trống')
        .isLength({ min: 3, max: 255 }).withMessage('Tên sinh viên phải từ 3–255 ký tự'),

    body('student_identifier')
        .notEmpty().withMessage('Mã sinh viên không được để trống')
        .isString().withMessage('Mã sinh viên phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã sinh viên tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã sinh viên chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang')
        .trim()
        .custom(async (value, { req }) => {
            if (!value) return true;
            const where = { student_identifier: String(value).trim() };
            if (req.params && req.params.id) where.id = { [Op.ne]: req.params.id };
            const exists = await Student.findOne({ where });
            if (exists) throw new Error('Mã sinh viên đã tồn tại');
            return true;
        }),
];

// ✅ Validator khi cập nhật sinh viên (optional fields)
exports.updateStudentValidator = [
    body('class_id')
        .optional()
        .isInt({ min: 1 }).withMessage('ID lớp học phải là số nguyên dương'),

    body('name')
        .optional()
        .isLength({ min: 3, max: 255 }).withMessage('Tên sinh viên phải từ 3–255 ký tự'),

    body('student_identifier')
        .optional()
        .isString().withMessage('Mã sinh viên phải là chuỗi')
        .isLength({ max: 50 }).withMessage('Mã sinh viên tối đa 50 ký tự')
        .matches(/^[A-Za-z0-9_-]+$/).withMessage('Mã sinh viên chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang')
        .trim()
        .custom(async (value, { req }) => {
            if (!value) return true;
            const where = { student_identifier: String(value).trim() };
            if (req.params && req.params.id) where.id = { [Op.ne]: req.params.id };
            const exists = await Student.findOne({ where });
            if (exists) throw new Error('Mã sinh viên đã tồn tại');
            return true;
        }),
];
