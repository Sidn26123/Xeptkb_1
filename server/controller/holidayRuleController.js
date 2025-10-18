const HolidayRule = require('../models/HolidayRule');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả quy tắc nghỉ
exports.getAllHolidayRules = async (req, res) => {
  try {
    const rules = await HolidayRule.findAll();
    res.status(200).json(new SuccessResponse(rules, 'Lấy danh sách quy tắc nghỉ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy quy tắc nghỉ theo id
exports.getHolidayRuleById = async (req, res) => {
  try {
    const rule = await HolidayRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json(new ErrorResponse('Không tìm thấy quy tắc nghỉ', 404));
    res.status(200).json(new SuccessResponse(rule, 'Lấy thông tin quy tắc nghỉ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo quy tắc nghỉ mới
exports.createHolidayRule = async (req, res) => {
  try {
    const { name, description, date_rule } = req.body;
    const newRule = await HolidayRule.create({ name, description, date_rule });
    res.status(201).json(new SuccessResponse(newRule, 'Tạo quy tắc nghỉ thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật quy tắc nghỉ
exports.updateHolidayRule = async (req, res) => {
  try {
    const { name, description, date_rule } = req.body;
    const rule = await HolidayRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json(new ErrorResponse('Không tìm thấy quy tắc nghỉ', 404));
    await rule.update({ name, description, date_rule });
    res.status(200).json(new SuccessResponse(rule, 'Cập nhật quy tắc nghỉ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa quy tắc nghỉ
exports.deleteHolidayRule = async (req, res) => {
  try {
    const rule = await HolidayRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json(new ErrorResponse('Không tìm thấy quy tắc nghỉ', 404));
    await rule.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa quy tắc nghỉ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};