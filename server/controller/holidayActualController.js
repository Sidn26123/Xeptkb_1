const HolidayActual = require('../models/HolidayActual');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả ngày nghỉ thực tế
exports.getAllHolidayActuals = async (req, res) => {
  try {
    const holidays = await HolidayActual.findAll();
    res.status(200).json(new SuccessResponse(holidays, 'Lấy danh sách ngày nghỉ thực tế thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy ngày nghỉ thực tế theo id
exports.getHolidayActualById = async (req, res) => {
  try {
    const holiday = await HolidayActual.findByPk(req.params.id);
    if (!holiday) return res.status(404).json(new ErrorResponse('Không tìm thấy ngày nghỉ thực tế', 404));
    res.status(200).json(new SuccessResponse(holiday, 'Lấy thông tin ngày nghỉ thực tế thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo ngày nghỉ thực tế mới
exports.createHolidayActual = async (req, res) => {
  try {
    const { date, description } = req.body;
    const newHoliday = await HolidayActual.create({ date, description });
    res.status(201).json(new SuccessResponse(newHoliday, 'Tạo ngày nghỉ thực tế thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật ngày nghỉ thực tế
exports.updateHolidayActual = async (req, res) => {
  try {
    const { date, description } = req.body;
    const holiday = await HolidayActual.findByPk(req.params.id);
    if (!holiday) return res.status(404).json(new ErrorResponse('Không tìm thấy ngày nghỉ thực tế', 404));
    await holiday.update({ date, description });
    res.status(200).json(new SuccessResponse(holiday, 'Cập nhật ngày nghỉ thực tế thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa ngày nghỉ thực tế
exports.deleteHolidayActual = async (req, res) => {
  try {
    const holiday = await HolidayActual.findByPk(req.params.id);
    if (!holiday) return res.status(404).json(new ErrorResponse('Không tìm thấy ngày nghỉ thực tế', 404));
    await holiday.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa ngày nghỉ thực tế thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};