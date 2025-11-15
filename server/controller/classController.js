const Class = require('../models/Classes');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

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
            { model: require('../models/Subjects'), as: 'Subject' },
            { model: require('../models/Teachers'), as: 'Teacher' }
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
    const { name, training_type_id, faculty_id } = req.body;
    const newClass = await Class.create({ name, training_type_id, faculty_id });
    res.status(201).json(new SuccessResponse(newClass, 'Tạo lớp học thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật lớp học
exports.updateClass = async (req, res) => {
  try {
    const { name, training_type_id, faculty_id } = req.body;
    const classItem = await Class.findByPk(req.params.id);
    if (!classItem) return res.status(404).json(new ErrorResponse('Không tìm thấy lớp học', 404));
    await classItem.update({ name, training_type_id, faculty_id });
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