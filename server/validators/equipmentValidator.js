const { body } = require('express-validator');
const Equipment = require('../models/Equipments');
const { Op } = require('sequelize');

exports.createEquipmentValidator = [
  body('name')
    .notEmpty().withMessage('Tên thiết bị là bắt buộc')
    .isString().withMessage('Tên thiết bị phải là chuỗi ký tự')
    .trim(),

  body('description')
    .optional({ nullable: true })
    .isString().withMessage('Mô tả phải là chuỗi ký tự')
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả quá dài'),

  // code is required in the DB schema — validate it and ensure uniqueness
  body('code')
    .notEmpty().withMessage('Mã thiết bị là bắt buộc')
    .isString().withMessage('Mã thiết bị phải là chuỗi ký tự')
    .trim()
    .custom(async (value, { req }) => {
      if (!value) return true;
      const where = { code: String(value).trim() };
      if (req.params && req.params.id) where.id = { [Op.ne]: req.params.id };
      const exists = await Equipment.findOne({ where });
      if (exists) throw new Error('Mã thiết bị đã tồn tại');
      return true;
    }),
];

exports.updateEquipmentValidator = [
  body('name')
    .optional()
    .isString().withMessage('Tên thiết bị phải là chuỗi ký tự')
    .trim()
    .notEmpty().withMessage('Tên thiết bị không được để trống'),

  body('description')
    .optional({ nullable: true })
    .isString().withMessage('Mô tả phải là chuỗi ký tự')
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả quá dài'),

  body('code').optional().custom(async (value, { req }) => {
    if (!value) return true;
    const where = { code: String(value).trim() };
    if (req.params && req.params.id) where.id = { [Op.ne]: req.params.id };
    const exists = await Equipment.findOne({ where });
    if (exists) throw new Error('Mã thiết bị đã tồn tại');
    return true;
  }),
];
