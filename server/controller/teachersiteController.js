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

// ===== Instructor unavailable times (teacher-facing) =====
const instructorUnavailableService = require('../services/instructorUnavailableTimeService');

exports.getUnavailableTimes = async (req, res) => {
  try {
    const user = req.user;
    let teacherId = null;
    if (user && user.profileId) teacherId = user.profileId;
    else if (user && user.id) {
      // try to resolve teacher record by user id
      const t = await require('../models').Teacher.findOne({ where: { user_id: user.id } });
      if (t) teacherId = t.id;
    }
    if (!teacherId) return res.status(404).json(new ErrorResponse('Không tìm thấy giảng viên', 404));

    const rows = await instructorUnavailableService.getByTeacher(teacherId);
    res.status(200).json(new SuccessResponse(rows, 'Lấy thời gian bận thành công'));
  } catch (err) {
    console.error('teachersite.getUnavailableTimes error:', err);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};

exports.replaceUnavailableTimes = async (req, res) => {
  try {
    const user = req.user;
    let teacherId = null;
    if (user && user.profileId) teacherId = user.profileId;
    else if (user && user.id) {
      const t = await require('../models').Teacher.findOne({ where: { user_id: user.id } });
      if (t) teacherId = t.id;
    }
    if (!teacherId) return res.status(404).json(new ErrorResponse('Không tìm thấy giảng viên', 404));

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    // basic validation: items must have day_id and time_slot_id as numbers
    const cleaned = items.map(i => ({ day_id: Number(i.day_id), time_slot_id: Number(i.time_slot_id) })).filter(i => Number.isFinite(i.day_id) && Number.isFinite(i.time_slot_id));

    const saved = await instructorUnavailableService.replaceForTeacher(teacherId, cleaned);
    res.status(200).json(new SuccessResponse(saved, 'Cập nhật thời gian bận thành công'));
  } catch (err) {
    console.error('teachersite.replaceUnavailableTimes error:', err);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};

exports.addUnavailableTime = async (req, res) => {
  try {
    const user = req.user;
    let teacherId = null;
    if (user && user.profileId) teacherId = user.profileId;
    else if (user && user.id) {
      const t = await require('../models').Teacher.findOne({ where: { user_id: user.id } });
      if (t) teacherId = t.id;
    }
    if (!teacherId) return res.status(404).json(new ErrorResponse('Không tìm thấy giảng viên', 404));

    const { day_id, time_slot_id } = req.body || {};
    if (!day_id || !time_slot_id) return res.status(400).json(new ErrorResponse('Thiếu day_id hoặc time_slot_id', 400));
    const row = await instructorUnavailableService.addIfNotExists(teacherId, Number(day_id), Number(time_slot_id));
    res.status(200).json(new SuccessResponse(row, 'Thêm thời gian bận thành công'));
  } catch (err) {
    console.error('teachersite.addUnavailableTime error:', err);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};

exports.deleteUnavailableTimes = async (req, res) => {
  try {
    const user = req.user;
    let teacherId = null;
    if (user && user.profileId) teacherId = user.profileId;
    else if (user && user.id) {
      const t = await require('../models').Teacher.findOne({ where: { user_id: user.id } });
      if (t) teacherId = t.id;
    }
    if (!teacherId) return res.status(404).json(new ErrorResponse('Không tìm thấy giảng viên', 404));

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const cleaned = items.map(i => ({ day_id: Number(i.day_id), time_slot_id: Number(i.time_slot_id) })).filter(i => Number.isFinite(i.day_id) && Number.isFinite(i.time_slot_id));
    const deleted = await instructorUnavailableService.deleteForTeacher(teacherId, cleaned);
    res.status(200).json(new SuccessResponse({ deleted }, 'Xóa thời gian bận thành công'));
  } catch (err) {
    console.error('teachersite.deleteUnavailableTimes error:', err);
    res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};
