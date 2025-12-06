const { Teacher, Faculty } = require('../models');
const { Op } = require('sequelize');

async function getTeacherById(id) {
  return await Teacher.findByPk(id);
}

async function getAllTeachers() {
  return await Teacher.findAll();
}

async function createTeacher(data) {
  return await Teacher.create(data);
}

/**
 * Import danh sách giảng viên từ Excel
 */
async function bulkImportTeachers(dataList) {
  // 1. Check dữ liệu đầu vào
  if (!dataList || !Array.isArray(dataList) || dataList.length === 0) {
    return { error: 'EMPTY_DATA' };
  }

  // 2. CHUẨN BỊ DỮ LIỆU THAM CHIẾU (Pre-fetch)

  // Lấy tất cả Khoa để tra cứu ID từ Mã Khoa (faculty_code)
  const faculties = await Faculty.findAll({
    attributes: ['id', 'code']
  });
  // Map: Key=CODE (Upper) -> Value=ID
  const facultyMap = new Map(faculties.map(f => [f.code ? f.code.toUpperCase() : '', f.id]));

  // Lấy danh sách Mã GV hiện tại để check trùng trong DB
  const incomingIds = dataList.map(item => item.teacher_identifier).filter(id => id);
  const existingTeachers = await Teacher.findAll({
    where: { teacher_identifier: { [Op.in]: incomingIds } },
    attributes: ['teacher_identifier']
  });
  const existingIdSet = new Set(existingTeachers.map(t => t.teacher_identifier));

  // 3. VALIDATE VÀ MAP DỮ LIỆU
  const errors = [];
  const validItems = [];
  const processedIds = new Set(); // Check trùng lặp ngay trong file Excel

  dataList.forEach((item, index) => {
    const rowNum = index + 1;
    let hasError = false;

    // --- Validate: Mã giảng viên ---
    const tId = item.teacher_identifier ? String(item.teacher_identifier).trim() : '';

    if (!tId) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu mã giảng viên` });
      hasError = true;
    } else if (existingIdSet.has(tId)) {
      errors.push({ msg: `Dòng ${rowNum}: Mã GV "${tId}" đã tồn tại trong hệ thống` });
      hasError = true;
    } else if (processedIds.has(tId)) {
      errors.push({ msg: `Dòng ${rowNum}: Mã GV "${tId}" bị lặp lại trong file` });
      hasError = true;
    } else {
      processedIds.add(tId);
    }

    // --- Validate: Tên giảng viên ---
    if (!item.name) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu tên giảng viên` });
      hasError = true;
    }

    // --- Validate & Map: KHOA (Faculty) ---
    let facultyId = null;
    const fCode = item.faculty_code ? String(item.faculty_code).toUpperCase().trim() : '';

    if (!fCode) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu mã khoa` });
      hasError = true;
    } else if (!facultyMap.has(fCode)) {
      errors.push({ msg: `Dòng ${rowNum}: Mã khoa "${fCode}" không tồn tại` });
      hasError = true;
    } else {
      facultyId = facultyMap.get(fCode);
    }

    // Nếu KHÔNG có lỗi -> Thêm vào danh sách insert
    if (!hasError) {
      validItems.push({
        teacher_identifier: tId,
        name: item.name,
        faculty_id: facultyId,           // Đã map sang ID
        academic_title: item.academic_title || null,
        date_of_birth: item.date_of_birth || null,
        gender: item.gender || null,
        phone: item.phone || null,
        email_school: item.email_school || null,
        email_personal: item.email_personal || null,
        address: item.address || null,
        id_number: item.id_number || null,
        nationality: item.nationality || 'Việt Nam',
        status: item.status || 'active', // Mặc định đang công tác
        // user_id thường sẽ null khi import, chờ tạo tài khoản sau
      });
    }
  });

  // 4. TRẢ KẾT QUẢ
  if (errors.length > 0) {
    return { error: 'VALIDATION_ERROR', errors: errors };
  }

  if (validItems.length === 0) {
    return { error: 'NO_VALID_ITEM' };
  }

  // Insert Database
  try {
    const createdData = await Teacher.bulkCreate(validItems);
    return { data: createdData };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getTeacherById,
  getAllTeachers,
  createTeacher,
  bulkImportTeachers
};