const { body, validationResult } = require('express-validator');

// Validation rules for propose-change endpoint
const validateProposeChange = [
  body('date')
    .notEmpty().withMessage('Ngày không được để trống')
    .isISO8601().withMessage('Định dạng ngày không hợp lệ (YYYY-MM-DD)'),
  
  body('courseClassId')
    .notEmpty().withMessage('ID học phần không được để trống')
    .isInt({ min: 1 }).withMessage('ID học phần phải là số nguyên dương'),
  
  body('prefer')
    .optional()
    .isIn(['room', 'time']).withMessage('prefer phải là "room" hoặc "time"'),
  
  body('maxCandidates')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('maxCandidates phải từ 1-100'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        reason: 'validation_error',
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation for propose-room (fixed time slot / replace room) endpoint
const validateProposeRoomChange = [
  body('date')
    .notEmpty().withMessage('Ngày không được để trống')
    .isISO8601().withMessage('Định dạng ngày không hợp lệ (YYYY-MM-DD)'),

  body('courseClassId')
    .notEmpty().withMessage('ID học phần không được để trống')
    .isInt({ min: 1 }).withMessage('ID học phần phải là số nguyên dương'),

  body('fixedTimeSlotId')
    .optional()
    .isInt({ min: 1 }).withMessage('fixedTimeSlotId phải là số nguyên dương'),

  body('scheduleInstanceId')
    .optional()
    .isInt({ min: 1 }).withMessage('scheduleInstanceId phải là số nguyên dương'),

  body('maxCandidates')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('maxCandidates phải từ 1-100'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        reason: 'validation_error',
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for apply-change endpoint
const validateApplyChange = [
  body('date')
    .notEmpty().withMessage('Ngày không được để trống')
    .isISO8601().withMessage('Định dạng ngày không hợp lệ (YYYY-MM-DD)'),
  
  body('courseClassId')
    .notEmpty().withMessage('ID học phần không được để trống')
    .isInt({ min: 1 }).withMessage('ID học phần phải là số nguyên dương'),
  
  body('selectedRoomId')
    .notEmpty().withMessage('ID phòng không được để trống')
    .isInt({ min: 1 }).withMessage('ID phòng phải là số nguyên dương'),
  
  body('selectedStartSlot')
    .notEmpty().withMessage('Tiết bắt đầu không được để trống')
    .isInt({ min: 1 }).withMessage('Tiết bắt đầu phải là số nguyên dương'),
  
  body('reason')
    .optional()
    .isString().withMessage('Lý do phải là chuỗi ký tự')
    .isLength({ max: 500 }).withMessage('Lý do không được quá 500 ký tự'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        reason: 'validation_error',
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateProposeChange,
  validateProposeRoomChange,
  validateApplyChange
};
