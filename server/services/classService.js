const Class = require('../models/Classes');
const Faculty = require('../models/Faculty');
const TrainingType = require('../models/TrainingType');
const { Op } = require('sequelize');
async function getClassById(id) {
  return await Class.findByPk(id);
}

async function getAllClasses() {
  return await Class.findAll();
}

async function createClass(data) {
  return await Class.create(data);
}
async function bulkImportClasses(dataList) {
  // 1. Check dữ liệu trống
  if (!dataList || !Array.isArray(dataList) || dataList.length === 0) {
    return { error: 'EMPTY_DATA' };
  }

  // 2. CHUẨN BỊ DỮ LIỆU THAM CHIẾU (Pre-fetch Reference Data)
  // Lấy tất cả Khoa và Hệ đào tạo để tra cứu ID từ Mã (Code)
  const faculties = await Faculty.findAll();
  const trainingTypes = await TrainingType.findAll();

  // Tạo Map để tra cứu nhanh (O(1)). Key là CODE (viết hoa), Value là ID
  // Giả sử model Faculty/TrainingType có cột 'code'. Nếu dùng 'name' thì sửa lại tương ứng.
  const facultyMap = new Map(faculties.map(f => [f.code ? f.code.toUpperCase() : '', f.id]));
  const typeMap = new Map(trainingTypes.map(t => [t.code ? t.code.toUpperCase() : '', t.id]));

  // Lấy danh sách tên lớp hiện tại để check trùng
  const incomingNames = dataList.map(item => item.name).filter(n => n);
  const existingClasses = await Class.findAll({
    where: { name: { [Op.in]: incomingNames } },
    attributes: ['name']
  });
  const existingNameSet = new Set(existingClasses.map(c => c.name));

  // 3. VALIDATE VÀ MAP DỮ LIỆU
  const errors = [];
  const validItems = [];
  const processedNames = new Set(); // Để check trùng lặp trong chính file excel

  dataList.forEach((item, index) => {
    const rowNum = index + 1;
    let hasError = false;

    // 3.1 Validate Tên lớp
    if (!item.name) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu tên lớp` });
      hasError = true;
    } else if (existingNameSet.has(item.name)) {
      errors.push({ msg: `Dòng ${rowNum}: Lớp "${item.name}" đã tồn tại trong hệ thống` });
      hasError = true;
    } else if (processedNames.has(item.name)) {
      errors.push({ msg: `Dòng ${rowNum}: Lớp "${item.name}" bị lặp lại trong file` });
      hasError = true;
    } else {
      processedNames.add(item.name);
    }

    // 3.2 Validate và Map KHOA (Faculty)
    let facultyId = null;
    const fCode = item.faculty_code ? String(item.faculty_code).toUpperCase().trim() : '';
    if (!fCode) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu mã khoa` });
      hasError = true;
    } else if (!facultyMap.has(fCode)) {
      errors.push({ msg: `Dòng ${rowNum}: Mã khoa "${fCode}" không tồn tại trong hệ thống` });
      hasError = true;
    } else {
      facultyId = facultyMap.get(fCode);
    }

    // 3.3 Validate và Map HỆ ĐÀO TẠO (Training Type)
    let typeId = null;
    const tCode = item.training_type_code ? String(item.training_type_code).toUpperCase().trim() : '';
    if (!tCode) {
      errors.push({ msg: `Dòng ${rowNum}: Thiếu mã hệ đào tạo` });
      hasError = true;
    } else if (!typeMap.has(tCode)) {
      errors.push({ msg: `Dòng ${rowNum}: Mã hệ đào tạo "${tCode}" không tồn tại` });
      hasError = true;
    } else {
      typeId = typeMap.get(tCode);
    }

    // Nếu không có lỗi thì đẩy vào mảng clean
    if (!hasError) {
      validItems.push({
        name: item.name,
        faculty_id: facultyId,        // Đã map sang ID
        training_type_id: typeId      // Đã map sang ID
      });
    }
  });

  // 4. KẾT QUẢ
  if (errors.length > 0) {
    return { error: 'VALIDATION_ERROR', errors: errors };
  }

  if (validItems.length === 0) {
    return { error: 'NO_VALID_ITEM' };
  }

  // Insert hàng loạt
  try {
    const createdData = await Class.bulkCreate(validItems);
    return { data: createdData };
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getClassById,
  getAllClasses,
  createClass,
  bulkImportClasses
};