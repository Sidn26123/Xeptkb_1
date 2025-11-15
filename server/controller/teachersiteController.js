const { Teacher, User, Faculty } = require('../models');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Controller cho teachersite (API dành cho client giáo viên)
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    let teacher = null;

    // Prefer profileId from token, else lookup by user_id
    if (user && user.profileId) {
      teacher = await Teacher.findByPk(user.profileId, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
        ]
      });
    } else if (user && user.id) {
      teacher = await Teacher.findOne({ where: { user_id: user.id },
        include: [ { model: User, as: 'user', attributes: ['id', 'username', 'role'] } ]
      });
    }

    if (!teacher) return res.status(404).json(new ErrorResponse('Không tìm thấy hồ sơ giảng viên', 404));

    // Attach faculty if available (Teacher model doesn't declare association to Faculty)
    try {
      if (teacher.faculty_id) {
        const faculty = await Faculty.findByPk(teacher.faculty_id);
        if (faculty) teacher.dataValues.faculty = faculty;
      }
    } catch (e) {
      // ignore faculty attach failures
      console.debug('Could not attach faculty to teacher profile', e && e.message ? e.message : e);
    }

    res.status(200).json(new SuccessResponse(teacher, 'Lấy hồ sơ giảng viên thành công'));
  } catch (err) {
    console.error('teachersite.getProfile error:', err && err.stack ? err.stack : err);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};

// Cập nhật một số trường profile cho giảng viên (địa chỉ, email cá nhân)
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { address, email_personal } = req.body || {};

    // basic server-side validation for email if provided
    if (email_personal && typeof email_personal === 'string') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email_personal)) return res.status(400).json(new ErrorResponse('Email không hợp lệ', 400));
    }

    let teacher = null;
    if (user && user.profileId) {
      teacher = await Teacher.findByPk(user.profileId);
    } else if (user && user.id) {
      teacher = await Teacher.findOne({ where: { user_id: user.id } });
    }

    if (!teacher) return res.status(404).json(new ErrorResponse('Không tìm thấy hồ sơ giảng viên', 404));

    // only update allowed fields
    if (typeof address !== 'undefined') teacher.address = address;
    if (typeof email_personal !== 'undefined') teacher.email_personal = email_personal;

    await teacher.save();

    // reload with associations for response
    const updated = await Teacher.findByPk(teacher.id, {
      include: [ { model: User, as: 'user', attributes: ['id', 'username', 'role'] } ]
    });

    // attach faculty if exists
    try {
      if (updated && updated.faculty_id) {
        const faculty = await Faculty.findByPk(updated.faculty_id);
        if (faculty) updated.dataValues.faculty = faculty;
      }
    } catch (e) { /* ignore */ }

    res.status(200).json(new SuccessResponse(updated, 'Cập nhật hồ sơ thành công'));
  } catch (err) {
    console.error('teachersite.updateProfile error:', err && err.stack ? err.stack : err);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};
