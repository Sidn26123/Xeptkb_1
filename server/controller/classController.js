const Class = require('../models/Classes');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const {bulkImportClasses} = require("../services/classService");

// Lấy tất cả lớp học
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.findAll();
    res.status(200).json(new SuccessResponse(classes, 'Lấy danh sách lớp học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy lớp học theo id (bao gồm associations để frontend có dữ liệu liên quan)
exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id, {
      include: [
        { model: require('../models/Faculty'), as: 'faculty' },
        { model: require('../models/CourseClasses'), as: 'courseclasses', include: [
            { model: require('../models/Subjects'), as: 'subject' },
            { model: require('../models/Teachers'), as: 'teacher' }
        ] }
      ]
    });

    if (!classItem) return res.status(404).json(new ErrorResponse('Không tìm thấy lớp học', 404));
    res.status(200).json(new SuccessResponse(classItem, 'Lấy thông tin lớp học thành công'));
  } catch (err) {
    console.error('Error in getClassById:', err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Tạo lớp học mới
exports.createClass = async (req, res) => {
  try {
    const { name, code, training_type_id, faculty_id } = req.body;
    const newClass = await Class.create({ name, code, training_type_id, faculty_id });
    res.status(201).json(new SuccessResponse(newClass, 'Tạo lớp học thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật lớp học
exports.updateClass = async (req, res) => {
  try {
    const { name, code, training_type_id, faculty_id } = req.body;
    const classItem = await Class.findByPk(req.params.id);
    if (!classItem) return res.status(404).json(new ErrorResponse('Không tìm thấy lớp học', 404));
    await classItem.update({ name, code, training_type_id, faculty_id });
    res.status(200).json(new SuccessResponse(classItem, 'Cập nhật lớp học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa lớp học
exports.deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id);
    if (!classItem) return res.status(404).json(new ErrorResponse('Không tìm thấy lớp học', 404));
    await classItem.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa lớp học thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

exports.bulkImportClasses = async (req, res) => {
  try {
    const result = await bulkImportClasses(req.body);

    if (result.error === 'EMPTY_DATA')
      return res.status(400).json(new ErrorResponse('Dữ liệu import trống', 400));

    if (result.error === 'NO_VALID_ITEM')
      return res.status(400).json(new ErrorResponse('Không có dữ liệu hợp lệ', 400));

    if (result.error === 'VALIDATION_ERROR') {
      return res.status(422).json({
        error: 'Dữ liệu import có lỗi tham chiếu',
        errors: result.errors
      });
    }

    return res.status(201).json(
        new SuccessResponse(result.data, `Đã import thành công ${result.data.length} lớp học`)
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json(new ErrorResponse('Lỗi Server: ' + err.message, 500));
  }
};