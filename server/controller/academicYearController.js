const AcademicYear = require('../models/AcademicYears');
const { SuccessResponse, ErrorResponse, ValidationResponse } = require('../utils/responseUtils');

// Lấy tất cả năm học
exports.getAllAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.findAll();
    res.status(200).json(new SuccessResponse(years, 'Lấy danh sách năm học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy năm học theo id
exports.getAcademicYearById = async (req, res) => {
  try {
    const year = await AcademicYear.findByPk(req.params.id);
    if (!year) return res.status(404).json(new ErrorResponse('Không tìm thấy năm học', 404));
    res.status(200).json(new SuccessResponse(year, 'Lấy thông tin năm học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo năm học mới
exports.createAcademicYear = async (req, res) => {
  try {
    const { year_code, start_date, end_date, status } = req.body;

    // Kiểm tra trùng mã năm học
    if (!year_code) return res.status(400).json(new ValidationResponse({ year_code: 'Mã năm học là bắt buộc' }));
    const existing = await AcademicYear.findOne({ where: { year_code } });
    if (existing) return res.status(400).json(new ValidationResponse({ year_code: 'Mã năm học đã tồn tại' }));

    const newYear = await AcademicYear.create({ year_code, start_date, end_date, status });
    res.status(201).json(new SuccessResponse(newYear, 'Tạo năm học thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật năm học
exports.updateAcademicYear = async (req, res) => {
  try {
    const { year_code, start_date, end_date, status } = req.body;
    const year = await AcademicYear.findByPk(req.params.id);
    if (!year) return res.status(404).json(new ErrorResponse('Không tìm thấy năm học', 404));

    // Nếu thay đổi year_code, đảm bảo không trùng
    if (year_code && year_code !== year.year_code) {
      const existing = await AcademicYear.findOne({ where: { year_code } });
      if (existing) return res.status(400).json(new ValidationResponse({ year_code: 'Mã năm học đã tồn tại' }));
    }

    await year.update({ year_code, start_date, end_date, status });
    res.status(200).json(new SuccessResponse(year, 'Cập nhật năm học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa năm học
exports.deleteAcademicYear = async (req, res) => {
  try {
    const year = await AcademicYear.findByPk(req.params.id);
    if (!year) return res.status(404).json(new ErrorResponse('Không tìm thấy năm học', 404));
    await year.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa năm học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};