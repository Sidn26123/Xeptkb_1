const Semester = require('../models/Semesters');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả học kỳ
exports.getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.findAll({ order: [['start', 'ASC']] });
    res.status(200).json(new SuccessResponse(semesters, 'Lấy danh sách học kỳ thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy học kỳ theo id
exports.getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findByPk(req.params.id);
    if (!semester) return res.status(404).json(new ErrorResponse('Không tìm thấy học kỳ', 404));
    res.status(200).json(new SuccessResponse(semester, 'Lấy thông tin học kỳ thành công'));
  } catch (err) {
    console.error('Lỗi lấy danh sách học kỳ:', err);
    console.error('Lỗi lấy thông tin học kỳ:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo học kỳ mới
exports.createSemester = async (req, res) => {
  try {
    const { AcademicYearsid, code, name, start, end, status } = req.body;
    if (!AcademicYearsid || !code || !name || !start || !end) {
      console.error('Lỗi 400 - Thiếu thông tin bắt buộc:', {
        body: req.body,
        message: 'Thiếu thông tin bắt buộc'
      });
      return res.status(400).json(new ErrorResponse('Thiếu thông tin bắt buộc', 400));
    }
    const exists = await Semester.findOne({ where: { code } });
    if (exists) {
      return res.status(409).json(new ErrorResponse('Mã học kỳ đã tồn tại', 409));
    }
    const semester = await Semester.create({ AcademicYearsid, code, name, start, end, status });
    res.status(201).json(new SuccessResponse(semester, 'Tạo học kỳ thành công', 201));
  } catch (err) {
    console.error('Lỗi tạo học kỳ:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật học kỳ
exports.updateSemester = async (req, res) => {
  try {
    const { AcademicYearsid, code, name, start, end, status } = req.body;
    const semester = await Semester.findByPk(req.params.id);
    if (!semester) return res.status(404).json(new ErrorResponse('Không tìm thấy học kỳ', 404));
    await semester.update({
      AcademicYearsid: AcademicYearsid !== undefined ? AcademicYearsid : semester.AcademicYearsid,
      code: code !== undefined ? code : semester.code,
      name: name !== undefined ? name : semester.name,
      start: start !== undefined ? start : semester.start,
      end: end !== undefined ? end : semester.end,
      status: status !== undefined ? status : semester.status,
    });
    res.status(200).json(new SuccessResponse(semester, 'Cập nhật học kỳ thành công'));
  } catch (err) {
    console.error('Lỗi cập nhật học kỳ:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa học kỳ
exports.deleteSemester = async (req, res) => {
  try {
    const semester = await Semester.findByPk(req.params.id);
    if (!semester) return res.status(404).json(new ErrorResponse('Không tìm thấy học kỳ', 404));
    await semester.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa học kỳ thành công'));
  } catch (err) {
    console.error('Lỗi xóa học kỳ:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};