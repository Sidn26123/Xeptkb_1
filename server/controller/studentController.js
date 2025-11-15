const { Student, User, Class, Faculty } = require('../models');
const { SuccessResponse, ErrorResponse, ValidationResponse } = require('../utils/responseUtils');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Lấy tất cả sinh viên
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'faculty_id'], include: [{ model: Faculty, as: 'faculty', attributes: ['id', 'name', 'faculty_id'] }] }
      ]
    });
    res.status(200).json(new SuccessResponse(students, 'Lấy danh sách sinh viên thành công'));
  } catch (err) {
     // Log detailed error information to help diagnose SQL/Sequelize issues
     console.error('getAllStudents error:', err && err.stack ? err.stack : err);
     if (err && err.original) console.error('Original DB error:', err.original);
     if (err && err.sql) console.error('Failed SQL:', err.sql);
     res.status(500).json(new ErrorResponse(err.message || 'Internal Server Error', 500));
  }
};

// Lấy sinh viên theo id
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'role'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'faculty_id'], include: [{ model: Faculty, as: 'faculty', attributes: ['id', 'name', 'faculty_id'] }] }
      ]
    });
    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy sinh viên', 404));
    res.status(200).json(new SuccessResponse(student, 'Lấy thông tin sinh viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Lấy hồ sơ sinh viên của user hiện tại (dùng sau khi verifyToken)
// NOTE: studentsite-specific profile endpoint moved to controller/studentsiteController.js

// Tạo sinh viên mới
exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      class_id,
      student_identifier,
      user_id,
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

    if (!name || !class_id || !student_identifier) {
      return res.status(400).json(new ValidationResponse([{ field: 'name/class_id/student_identifier', message: 'Các trường name, class_id và student_identifier là bắt buộc' }]));
    }

    // if email_school not provided, generate from student_identifier
    let final_email_school = email_school ?? null;
    if (!final_email_school) {
      const domain = 'student.example.edu.vn';
      // sanitize identifier for email local part
      const localBase = String(student_identifier).toLowerCase().replace(/\s+/g, '');
      let candidate = `${localBase}@${domain}`;
      let counter = 0;
      // ensure uniqueness among users (username will equal email_school)
      while (await User.findOne({ where: { username: candidate } })) {
        counter += 1;
        candidate = `${localBase}${counter}@${domain}`;
      }
      final_email_school = candidate;
    }

    const payload = {
      name,
      class_id,
      student_identifier,
      user_id: user_id ?? null,
      date_of_birth: date_of_birth ?? null,
      gender: gender ?? null,
      status: status ?? null,
      phone: phone ?? null,
      id_number: id_number ?? null,
      ethnicity: ethnicity ?? null,
      religion: religion ?? null,
      place_of_birth: place_of_birth ?? null,
      nationality: nationality ?? null,
      email_school: final_email_school,
      email_personal: email_personal ?? null,
      address: address ?? null,
    };

    // Use a transaction so student creation and optional user creation are atomic
    const t = await Student.sequelize.transaction();
    try {
      const newStudent = await Student.create(payload, { transaction: t });

      // If no user_id provided, attempt to create a user account for this student using the generated email_school
      let createdUser = null;
      let generatedPassword = null;
      if (!newStudent.user_id && newStudent.email_school) {
        // check if a user with that username already exists
        createdUser = await User.findOne({ where: { username: newStudent.email_school }, transaction: t });
        if (!createdUser) {
          // generate password based on student_identifier + '#' + ddmmyyyy if date_of_birth available
          if (newStudent.student_identifier && newStudent.date_of_birth) {
            try {
              const idPart = String(newStudent.student_identifier).toLowerCase().replace(/\s+/g, '');
              const dob = String(newStudent.date_of_birth); // expected format: YYYY-MM-DD
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
          createdUser = await User.create({ username: newStudent.email_school, password: hash, role: 'student' }, { transaction: t });
        }

        // associate the user to the student if not already linked
        if (createdUser && !newStudent.user_id) {
          newStudent.user_id = createdUser.id;
          await newStudent.save({ transaction: t });
        }
      }

      await t.commit();

  const created = await Student.findByPk(newStudent.id, { include: [{ model: User, as: 'user', attributes: ['id', 'username', 'role'] }] });
  // include generated password in response only when we created it here
  const responseData = { student: created };
  if (generatedPassword) responseData.generatedPassword = generatedPassword;
  res.status(201).json(new SuccessResponse(responseData, 'Tạo sinh viên thành công', 201));
    } catch (txErr) {
      await t.rollback();
      throw txErr;
    }
  } catch (err) {
    // handle unique constraint
    console.error('createStudent error:', err.stack || err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(new ErrorResponse('Dữ liệu trùng (student_identifier hoặc user_id) đã tồn tại', 409));
    }
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Cập nhật sinh viên
exports.updateStudent = async (req, res) => {
  try {
    const {
      name,
      class_id,
      student_identifier,
      user_id,
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

    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy sinh viên', 404));

    await student.update({
      name: name ?? student.name,
      class_id: class_id ?? student.class_id,
      student_identifier: student_identifier ?? student.student_identifier,
      user_id: user_id ?? student.user_id,
  date_of_birth: date_of_birth ?? student.date_of_birth,
  gender: gender ?? student.gender,
  status: status ?? student.status,
  phone: phone ?? student.phone,
  id_number: id_number ?? student.id_number,
  ethnicity: ethnicity ?? student.ethnicity,
  religion: religion ?? student.religion,
  place_of_birth: place_of_birth ?? student.place_of_birth,
  nationality: nationality ?? student.nationality,
  email_school: email_school ?? student.email_school,
  email_personal: email_personal ?? student.email_personal,
  address: address ?? student.address,
    });

    const updated = await Student.findByPk(student.id, { include: [{ model: User, as: 'user', attributes: ['id', 'username', 'role'] }] });
    res.status(200).json(new SuccessResponse(updated, 'Cập nhật sinh viên thành công'));
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(new ErrorResponse('Dữ liệu trùng (student_identifier hoặc user_id) đã tồn tại', 409));
    }
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};

// Xóa sinh viên
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json(new ErrorResponse('Không tìm thấy sinh viên', 404));
    await student.destroy();
    res.status(200).json(new SuccessResponse(null, 'Xóa sinh viên thành công'));
  } catch (err) {
    res.status(500).json(new ErrorResponse(err.message, 500));
  }
};