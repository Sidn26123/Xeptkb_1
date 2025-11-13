const { Student, User, Class, Faculty } = require('../models');
const bcrypt = require('bcrypt');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Controller dành riêng cho studentsite (API công khai nội bộ cho client sinh viên)
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    let student = null;

    // Ưu tiên dùng profileId được ghi trong token (nếu có), fallback tìm theo user_id
    if (user && user.profileId) {
      student = await Student.findByPk(user.profileId, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
          { model: Class, as: 'class', attributes: ['id', 'name', 'faculty_id'], include: [{ model: Faculty, as: 'faculty', attributes: ['id', 'name', 'faculty_id'] }] }
        ]
      });
    } else if (user && user.id) {
      student = await Student.findOne({ where: { user_id: user.id },
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
          { model: Class, as: 'class', attributes: ['id', 'name', 'faculty_id'], include: [{ model: Faculty, as: 'faculty', attributes: ['id', 'name', 'faculty_id'] }] }
        ]
      });
    }

    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy hồ sơ sinh viên', 404));
    // Trả đối tượng student thô (client chịu trách nhiệm hiển thị các trường cần thiết)
    res.status(200).json(new SuccessResponse(student, 'Lấy hồ sơ sinh viên thành công'));
  } catch (err) {
    console.error('studentsite.getProfile error:', err && err.stack ? err.stack : err);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};

// Cập nhật một số trường profile cho sinh viên (địa chỉ, email cá nhân)
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { address, email_personal } = req.body || {};

    // basic server-side validation for email if provided
    if (email_personal && typeof email_personal === 'string') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email_personal)) return res.status(400).json({ status: 'error', message: 'Email không hợp lệ' });
    }

    let student = null;
    if (user && user.profileId) {
      student = await Student.findByPk(user.profileId);
    } else if (user && user.id) {
      student = await Student.findOne({ where: { user_id: user.id } });
    }

    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy hồ sơ sinh viên', 404));

    // only update allowed fields
    if (typeof address !== 'undefined') student.address = address;
    if (typeof email_personal !== 'undefined') student.email_personal = email_personal;

    await student.save();

    // reload with associations for response
    const updated = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'faculty_id'], include: [{ model: Faculty, as: 'faculty', attributes: ['id', 'name', 'faculty_id'] }] }
      ]
    });

    res.status(200).json(new SuccessResponse(updated, 'Cập nhật hồ sơ thành công'));
  } catch (err) {
    console.error('studentsite.updateProfile error:', err && err.stack ? err.stack : err);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};