const HolidayRule = require('../models/HolidayRule');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả quy tắc nghỉ
exports.getAllHolidayRules = async (req, res) => {
  try {
    const rules = await HolidayRule.findAll({
      order: [['month', 'ASC'], ['day_start', 'ASC']]
    });
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
    const { name, month, day_start, day_end, is_lunar, recurring, description } = req.body;
    
    // Validate
    if (!name || !month || !day_start || !day_end) {
      return res.status(400).json(new ErrorResponse('Thiếu thông tin bắt buộc', 400));
    }

    if (day_start > day_end) {
      return res.status(400).json(new ErrorResponse('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 400));
    }

    const newRule = await HolidayRule.create({ 
      name, 
      month,
      day_start, 
      day_end, 
      is_lunar: is_lunar || false,
      recurring: recurring !== undefined ? recurring : true,
      description 
    });
    
    res.status(201).json(new SuccessResponse(newRule, 'Tạo quy tắc nghỉ thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật quy tắc nghỉ
exports.updateHolidayRule = async (req, res) => {
  try {
    const { name, month, day_start, day_end, is_lunar, recurring, description } = req.body;
    const rule = await HolidayRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json(new ErrorResponse('Không tìm thấy quy tắc nghỉ', 404));
    
    // Validate if updating dates
    const updateDayStart = day_start || rule.day_start;
    const updateDayEnd = day_end || rule.day_end;
    
    if (updateDayStart > updateDayEnd) {
      return res.status(400).json(new ErrorResponse('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 400));
    }

    await rule.update({ 
      name: name || rule.name,
      month: month || rule.month,
      day_start: updateDayStart,
      day_end: updateDayEnd,
      is_lunar: is_lunar !== undefined ? is_lunar : rule.is_lunar,
      recurring: recurring !== undefined ? recurring : rule.recurring,
      description: description !== undefined ? description : rule.description
    });
    
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
