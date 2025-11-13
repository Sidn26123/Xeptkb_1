const CourseClass = require('../models/CourseClasses');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
const Subject = require('../models/Subjects');
// Lấy tất cả lớp học phần
exports.getAllCourseClasses = async (req, res) => {
  try {
    const courseClasses = await CourseClass.findAll();
    res.status(200).json(new SuccessResponse(courseClasses, 'Lấy danh sách lớp học phần thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy lớp học phần theo id
exports.getCourseClassById = async (req, res) => {
  try {
    const courseClass = await CourseClass.findByPk(req.params.id);
    if (!courseClass) return res.status(404).json(new ErrorResponse('Không tìm thấy lớp học phần', 404));
    res.status(200).json(new SuccessResponse(courseClass, 'Lấy thông tin lớp học phần thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};
// Bạn cần import CourseClass (và các model khác) từ file models/index.js
// nơi đã khởi tạo tất cả các model và chạy các hàm associate()

// Lấy lớp học phần theo id, bao gồm cả thông tin môn học
exports.getFullInfoCourseClassById = async (req, res) => {
  try {
    const courseClass = await CourseClass.findByPk(req.params.id, {
      include: [{
        model: Subject, // Chỉ định model bạn muốn "include"
        as: 'subject'   // Dùng đúng alias 'as' bạn đã định nghĩa trong CourseClass.associate
      }]
    });

    if (!courseClass) {
      return res.status(404).json(new ErrorResponse('Không tìm thấy lớp học phần', 404));
    }

    // Kết quả trả về bây giờ sẽ là object CourseClass có chứa
    // một object "subject" lồng bên trong
    res.status(200).json(new SuccessResponse(courseClass, 'Lấy thông tin lớp học phần thành công'));
  } catch (err) {
    console.log(err);
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

exports.getAllFullInfoCourseClasses = async (req, res) => {
    try {
        const courseClasses = await CourseClass.findAll({
            include: [{
                model: Subject,
                as: 'subject'
            }]
        });
        res.status(200).json(new SuccessResponse(courseClasses, 'Lấy danh sách lớp học phần thành công'));
    } catch (err) {
        console.log(err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
}

// Tạo lớp học phần mới
exports.createCourseClass = async (req, res) => {
  try {
    const { name, class_id, subject_id, teacher_id, semester_id } = req.body;
    const newCourseClass = await CourseClass.create({ name, class_id, subject_id, teacher_id, semester_id });
    res.status(201).json(new SuccessResponse(newCourseClass, 'Tạo lớp học phần thành công', 201));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật lớp học phần
exports.updateCourseClass = async (req, res) => {
  try {
    const { name, class_id, subject_id, teacher_id, semester_id } = req.body;
    const courseClass = await CourseClass.findByPk(req.params.id);
    if (!courseClass) return res.status(404).json(new ErrorResponse('Không tìm thấy lớp học phần', 404));
    await courseClass.update({ name, class_id, subject_id, teacher_id, semester_id });
    res.status(200).json(new SuccessResponse(courseClass, 'Cập nhật lớp học phần thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa lớp học phần
exports.deleteCourseClass = async (req, res) => {
  try {
    const courseClass = await CourseClass.findByPk(req.params.id);
    if (!courseClass) return res.status(404).json(new ErrorResponse('Không tìm thấy lớp học phần', 404));
    await courseClass.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa lớp học phần thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};