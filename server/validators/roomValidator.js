const { body } = require('express-validator');
const Room = require('../models/Rooms');
const { Op } = require('sequelize');

exports.createRoomValidator = [
  body('code')
    .optional()
    .isString().withMessage('Mã phòng phải là chuỗi ký tự')
    .trim()
    .notEmpty().withMessage('Mã phòng không được để trống'),

  body('name')
    .notEmpty().withMessage('Tên phòng là bắt buộc')
    .isString().withMessage('Tên phòng phải là chuỗi ký tự')
    .trim(),

  body('buildings_id')
    .notEmpty().withMessage('Tòa nhà (buildings_id) là bắt buộc')
    .isInt({ gt: 0 }).withMessage('buildings_id phải là số nguyên dương'),

  body('capacity_max')
    .optional({ nullable: true })
    .custom(value => {
      if (value === null || value === '' || value === undefined) return true;
      if (!Number.isFinite(Number(value))) throw new Error('capacity_max phải là số');
      if (Number(value) < 0) throw new Error('capacity_max phải >= 0');
      return true;
    }),

  body('capacity_optimal')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (value === null || value === '' || value === undefined) return true;
      if (!Number.isFinite(Number(value))) throw new Error('capacity_optimal phải là số');
      if (Number(value) < 0) throw new Error('capacity_optimal phải >= 0');
      const max = req.body.capacity_max;
      if (max !== undefined && max !== null && max !== '' && Number.isFinite(Number(max))) {
        // Enforce strict inequality: optimal must be less than max
        if (Number(value) >= Number(max)) throw new Error('capacity_optimal phải nhỏ hơn capacity_max');
      }
      return true;
    }),

  body('floor_number')
    .optional({ nullable: true })
    .custom(value => {
      if (value === null || value === '' || value === undefined) return true;
      if (!Number.isFinite(Number(value))) throw new Error('floor_number phải là số');
      if (!Number.isInteger(Number(value)) || Number(value) < 0) throw new Error('floor_number phải là số nguyên không âm');
      return true;
    }),

    // Ensure `code` is unique across rooms
    body('code').optional().custom(async (value, { req }) => {
      if (!value) return true;
      const where = { code: String(value).trim() };
      if (req.params && req.params.id) where.id = { [Op.ne]: req.params.id };
      const exists = await Room.findOne({ where });
      if (exists) throw new Error('Mã phòng đã tồn tại');
      return true;
    }),
    // Composite uniqueness: buildings_id + floor_number + room_seq
    body().custom(async (_, { req }) => {
      try {
        // If client supplied `code`, prefer that uniqueness check and skip composite check
        if (req.body && req.body.code) return true;
        const b = req.body.buildings_id;
        const seq = req.body.room_seq;
        // only validate when buildings and seq provided
        if (!b || (seq === null || seq === undefined || seq === '')) return true;
        const floor = (req.body.floor_number === '' || req.body.floor_number === null || typeof req.body.floor_number === 'undefined') ? null : req.body.floor_number;
        const where = { buildings_id: b, room_seq: seq };
        // include floor_number in check (null-safe)
        where.floor_number = floor;
        if (req.params && req.params.id) where.id = { [Op.ne]: req.params.id };
        const exists = await Room.findOne({ where });
        if (exists) throw new Error('Số phòng này đã tồn tại trong cùng tòa và tầng');
        return true;
      } catch (err) {
        // don't leak SQL/internal errors to client; skip composite validation on unexpected error
        return true;
      }
    }),
];

exports.updateRoomValidator = [
  // similar to create but all fields optional
  body('code')
    .optional()
    .isString().withMessage('Mã phòng phải là chuỗi ký tự')
    .trim()
    .notEmpty().withMessage('Mã phòng không được để trống'),

  body('name')
    .optional()
    .isString().withMessage('Tên phòng phải là chuỗi ký tự')
    .trim()
    .notEmpty().withMessage('Tên phòng không được để trống'),

  body('buildings_id')
    .optional()
    .notEmpty().withMessage('Tòa nhà (buildings_id) là bắt buộc')
    .isInt({ gt: 0 }).withMessage('buildings_id phải là số nguyên dương'),

  body('capacity_max')
    .optional({ nullable: true })
    .custom(value => {
      if (value === null || value === '' || value === undefined) return true;
      if (!Number.isFinite(Number(value))) throw new Error('capacity_max phải là số');
      if (Number(value) < 0) throw new Error('capacity_max phải >= 0');
      return true;
    }),

  body('capacity_optimal')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (value === null || value === '' || value === undefined) return true;
      if (!Number.isFinite(Number(value))) throw new Error('capacity_optimal phải là số');
      if (Number(value) < 0) throw new Error('capacity_optimal phải >= 0');
      const max = req.body.capacity_max;
      if (max !== undefined && max !== null && max !== '' && Number.isFinite(Number(max))) {
        if (Number(value) >= Number(max)) throw new Error('capacity_optimal phải nhỏ hơn capacity_max');
      }
      return true;
    }),

  body('floor_number')
    .optional({ nullable: true })
    .custom(value => {
      if (value === null || value === '' || value === undefined) return true;
      if (!Number.isFinite(Number(value))) throw new Error('floor_number phải là số');
      if (!Number.isInteger(Number(value)) || Number(value) < 0) throw new Error('floor_number phải là số nguyên không âm');
      return true;
    }),
];
