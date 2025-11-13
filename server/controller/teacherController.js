const { Teacher, User } = require('../models');
const ErrorResponse = require('../utils/responseUtils').ErrorResponse;
const { SuccessResponse } = require('../utils/responseUtils');
const asyncHandler = require('../middleware/asyncHandler');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Lấy tất cả giáo viên
exports.getAllTeachers = asyncHandler(async (req, res, next) => {
  const teachers = await Teacher.findAll();
  res.status(200).json(new SuccessResponse(teachers, 'Lấy danh sách giáo viên thành công'));
});

// Lấy giáo viên theo id
exports.getTeacherById = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findByPk(req.params.id);

  if (!teacher) {
    return next(new ErrorResponse('Không tìm thấy giáo viên', 404));
  }

  res.status(200).json(new SuccessResponse(teacher, 'Lấy thông tin giáo viên thành công'));
});

// Tạo giáo viên mới
exports.createTeacher = asyncHandler(async (req, res, next) => {
  const {
    name,
    faculty_id,
    teacher_identifier,
    academic_title,
    date_of_birth,
    gender,
    status,
    phone,
    id_number,
    ethnicity,
    religion,
    place_of_birth,
    nationality,
    email_school,
    email_personal,
    address,
  } = req.body;

  // Require same minimal fields as students: name, faculty_id, teacher_identifier
  if (!name || !teacher_identifier || !faculty_id) {
    const { ValidationResponse } = require('../utils/responseUtils');
    return res.status(400).json(new ValidationResponse([
      { field: 'name/faculty_id/teacher_identifier', message: 'Các trường name, faculty_id và teacher_identifier là bắt buộc' }
    ]));
  }

  // validate teacher_identifier format and length (match frontend)
  const id = String(teacher_identifier || '');
  if (!/^[A-Za-z0-9_-]+$/.test(id) || id.length > 50) {
    const { ValidationResponse } = require('../utils/responseUtils');
    return res.status(400).json(new ValidationResponse([
      { field: 'teacher_identifier', message: 'Mã giáo viên không hợp lệ — chỉ chữ/số/gạch ngang/gạch dưới, tối đa 50 ký tự' }
    ]));
  }

  // if email_school not provided, generate from teacher_identifier
  let final_email_school = email_school ?? null;
  if (!final_email_school) {
    const domain = 'teacher.example.edu.vn';
    const localBase = String(teacher_identifier).toLowerCase().replace(/\s+/g, '');
    let candidate = `${localBase}@${domain}`;
    let counter = 0;
    while (await User.findOne({ where: { username: candidate } })) {
      counter += 1;
      candidate = `${localBase}${counter}@${domain}`;
    }
    final_email_school = candidate;
  }

  // transaction so teacher + user creation is atomic
  const t = await Teacher.sequelize.transaction();
  let committed = false;
  try {
    // prefer `academic_title` but keep existing `hoc_ham` column for backward compatibility
    const newTeacher = await Teacher.create({ name, faculty_id, teacher_identifier, academic_title: academic_title ?? null, hoc_ham: academic_title ?? null, date_of_birth, gender, status, phone, id_number, ethnicity, religion, place_of_birth, nationality, email_school: final_email_school, email_personal, address }, { transaction: t });

    // If teacher has no user_id, try to create a User using final_email_school as username
    let createdUser = null;
    let generatedPassword = null;
    if (!newTeacher.user_id && final_email_school) {
      createdUser = await User.findOne({ where: { username: final_email_school }, transaction: t });
      if (!createdUser) {
        // generate password based on teacher_identifier + '#' + ddmmyyyy if date_of_birth available
        if (newTeacher.teacher_identifier && newTeacher.date_of_birth) {
          try {
            const idPart = String(newTeacher.teacher_identifier).toLowerCase().replace(/\s+/g, '');
            const dob = String(newTeacher.date_of_birth); // expected format: YYYY-MM-DD
            const [y, m, d] = dob.split('-');
            const dobPart = `${d}${m}${y}`;
            generatedPassword = `${idPart}#${dobPart}`;
          } catch (e) {
            generatedPassword = crypto.randomBytes(6).toString('hex');
          }
        } else {
          generatedPassword = crypto.randomBytes(6).toString('hex');
        }

        const hash = await bcrypt.hash(generatedPassword, 10);
        createdUser = await User.create({ username: final_email_school, password: hash, role: 'teacher' }, { transaction: t });
        // consider emailing generatedPassword to teacher or returning it to admin
      }

      if (createdUser && !newTeacher.user_id) {
        newTeacher.user_id = createdUser.id;
        await newTeacher.save({ transaction: t });
      }
    }

    await t.commit();
    committed = true;

  const created = await Teacher.findByPk(newTeacher.id, { include: [{ model: User, as: 'user', attributes: ['id', 'username', 'role'] }] });
  const responseData = { teacher: created };
  if (generatedPassword) responseData.generatedPassword = generatedPassword;
  res.status(201).json(new SuccessResponse(responseData, 'Tạo giáo viên thành công', 201));
  } catch (err) {
    if (!committed) {
      await t.rollback();
    }
    // If Sequelize validation/unique constraint error, return structured validation response
    if (err && (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError')) {
      const { ValidationResponse } = require('../utils/responseUtils');
      const errors = (err.errors || []).map(e => ({ field: e.path || e.origin || 'field', message: e.message }));
      return res.status(400).json(new ValidationResponse(errors, 'Validation failed'));
    }
    throw err;
  }
});

// Cập nhật giáo viên
exports.updateTeacher = asyncHandler(async (req, res, next) => {
  const {
    name,
    faculty_id,
    teacher_identifier,
    academic_title,
    date_of_birth,
    gender,
    status,
    phone,
    id_number,
    ethnicity,
    religion,
    place_of_birth,
    nationality,
    email_school,
    email_personal,
    address,
  } = req.body;

  const teacher = await Teacher.findByPk(req.params.id);

  if (!teacher) {
    return next(new ErrorResponse('Không tìm thấy giáo viên', 404));
  }

  // validate teacher_identifier if provided
  if (teacher_identifier) {
    const id = String(teacher_identifier || '');
    if (!/^[A-Za-z0-9_-]+$/.test(id) || id.length > 50) {
      const { ValidationResponse } = require('../utils/responseUtils');
      return res.status(400).json(new ValidationResponse([
        { field: 'teacher_identifier', message: 'Mã giáo viên không hợp lệ — chỉ chữ/số/gạch ngang/gạch dưới, tối đa 50 ký tự' }
      ]));
    }
  }

  await teacher.update({
    name: name ?? teacher.name,
    faculty_id: faculty_id ?? teacher.faculty_id,
    teacher_identifier: teacher_identifier ?? teacher.teacher_identifier,
  // update both english and existing vietnamese column
  academic_title: academic_title ?? teacher.academic_title,
  hoc_ham: academic_title ?? teacher.hoc_ham,
    date_of_birth: date_of_birth ?? teacher.date_of_birth,
    gender: gender ?? teacher.gender,
    status: status ?? teacher.status,
    phone: phone ?? teacher.phone,
    id_number: id_number ?? teacher.id_number,
    ethnicity: ethnicity ?? teacher.ethnicity,
    religion: religion ?? teacher.religion,
    place_of_birth: place_of_birth ?? teacher.place_of_birth,
    nationality: nationality ?? teacher.nationality,
    email_school: email_school ?? teacher.email_school,
    email_personal: email_personal ?? teacher.email_personal,
    address: address ?? teacher.address,
  });

  const updated = await Teacher.findByPk(teacher.id, { include: [{ model: User, as: 'user', attributes: ['id', 'username', 'role'] }] });
  res.status(200).json(new SuccessResponse(updated, 'Cập nhật giáo viên thành công'));
});

// Xóa giáo viên
exports.deleteTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findByPk(req.params.id);

  if (!teacher) {
    return next(new ErrorResponse('Không tìm thấy giáo viên', 404));
  }

  await teacher.destroy();
  res.status(200).json(new SuccessResponse(null, 'Xóa giáo viên thành công'));
});