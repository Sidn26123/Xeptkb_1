const { Student, Class } = require('../models'); // Import thêm Class để check mã lớp
const { Op } = require('sequelize');

/**
 * Tìm sinh viên theo mã định danh
 */
async function getStudentByIdentifier(student_identifier) {
  return await Student.findOne({ where: { student_identifier } });
}

/**
 * Lấy tất cả sinh viên
 */
async function getAllStudents() {
  return await Student.findAll();
}

/**
 * Tạo mới sinh viên
 */
async function createStudent(data) {
  return await Student.create(data);
}

/**
 * Import danh sách sinh viên từ Excel
 * Logic tương tự bulkImportClasses
 */
async function bulkImportStudents(dataList) {
  // 1. Check dữ liệu trống
  if (!dataList || !Array.isArray(dataList) || dataList.length === 0) {
    return { error: 'EMPTY_DATA' };
  }

  // 2. CHUẨN BỊ DỮ LIỆU THAM CHIẾU (Pre-fetch Reference Data)

  // Lấy tất cả Lớp để tra cứu ID từ Mã Lớp (class_code)
  const classes = await Class.findAll({
    attributes: ['id', 'code']
  });

  // Tạo Map để tra cứu nhanh (O(1)). Key là CODE (viết hoa), Value là ID
  const classMap = new Map(classes.map(c => [c.code ? c.code.toUpperCase() : '', c.id]));

  // Lấy danh sách Mã sinh viên (student_identifier) hiện tại để check trùng
  const incomingIds = dataList.map(item => item.student_identifier).filter(id => id);
  const existingStudents = await Student.findAll({
    where: { student_identifier: { [Op.in]: incomingIds } },
    attributes: ['student_identifier']
  });
  const existingIdSet = new Set(existingStudents.map(s => s.student_identifier));

  // 3. VALIDATE VÀ MAP DỮ LIỆU
  const errors = [];
  const validItems = [];
  const processedIds = new Set(); // Để check trùng lặp trong chính file excel

  dataList.forEach((item, index) => {
    const rowNum = index + 1;
    let hasError = false;

    // 3.1 Validate Mã sinh viên (student_identifier)
    // MSV là bắt buộc và duy nhất
    if (!item.student_identifier) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu mã sinh viên` });
      hasError = true;
    } else if (existingIdSet.has(item.student_identifier)) {
      errors.push({ msg: `Dòng ${rowNum}: Mã SV "${item.student_identifier}" đã tồn tại trong hệ thống` });
      hasError = true;
    } else if (processedIds.has(item.student_identifier)) {
      errors.push({ msg: `Dòng ${rowNum}: Mã SV "${item.student_identifier}" bị lặp lại trong file` });
      hasError = true;
    } else {
      processedIds.add(item.student_identifier);
    }

    // Validate Tên sinh viên
    if (!item.name) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu tên sinh viên` });
      hasError = true;
    }

    // 3.2 Validate và Map LỚP (Class)
    // Excel gửi lên 'class_code', ta cần tìm ra 'class_id'
    let classId = null;
    const cCode = item.class_code ? String(item.class_code).toUpperCase().trim() : '';

    if (!cCode) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu mã lớp sinh hoạt` });
      hasError = true;
    } else if (!classMap.has(cCode)) {
      errors.push({ msg: `Dòng ${rowNum}: Mã lớp "${cCode}" không tồn tại trong hệ thống` });
      hasError = true;
    } else {
      classId = classMap.get(cCode);
    }

    // Nếu không có lỗi thì đẩy vào mảng clean
    if (!hasError) {
      validItems.push({
        student_identifier: item.student_identifier,
        name: item.name,
        class_id: classId,              // Đã map từ class_code sang ID
        date_of_birth: item.date_of_birth || null,
        gender: item.gender || null,
        phone: item.phone || null,
        email_school: item.email_school || null,
        email_personal: item.email_personal || null,
        address: item.address || null,
        id_number: item.id_number || null,
        nationality: item.nationality || 'Việt Nam',
        // Các trường khác map tương tự nếu cần
      });
    }
  });

  // 4. KẾT QUẢ
  if (errors.length > 0) {
    // Trả về lỗi validate để Frontend hiển thị cho người dùng sửa
    return { error: 'VALIDATION_ERROR', errors: errors };
  }

  if (validItems.length === 0) {
    return { error: 'NO_VALID_ITEM' };
  }

  // Insert hàng loạt
  try {
    const createdData = await Student.bulkCreate(validItems);
    return { data: createdData };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getStudentByIdentifier,
  getAllStudents,
  createStudent,
  bulkImportStudents
};