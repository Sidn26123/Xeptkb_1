const Equipment = require('../models/Equipments');
const sequelize = require('../config/initSequelize'); // Đường dẫn đến instance sequelize của bạn
const { Op } = require('sequelize');

async function getEquipmentById(id) {
  return await Equipment.findByPk(id);
}

async function getAllEquipments() {
  return await Equipment.findAll();
}

async function createEquipment(data) {
  return await Equipment.create(data);
}
// Import hàng loạt
async function bulkImportEquipments(dataList) {
  // 1. Check dữ liệu trống
  if (!dataList || !Array.isArray(dataList) || dataList.length === 0) {
    return { error: 'EMPTY_DATA' };
  }

  // 2. Validate logic (Check trùng mã) TRƯỚC KHI INSERT
  const incomingCodes = dataList.map(item => item.code).filter(c => c);

  // Tìm trong DB xem có mã nào đã tồn tại chưa
  const existingEquipments = await Equipment.findAll({
    where: {
      code: {
        [Op.in]: incomingCodes
      }
    },
    attributes: ['code']
  });

  // Nếu tìm thấy mã trùng -> Trả về lỗi VALIDATION_ERROR ngay
  if (existingEquipments.length > 0) {
    const duplicateCodes = existingEquipments.map(e => e.code);

    // Tạo danh sách lỗi chi tiết để Frontend hiển thị
    const errors = duplicateCodes.map(code => ({
      msg: `Mã thiết bị "${code}" đã tồn tại trong hệ thống.`,
      value: code
    }));

    return {
      error: 'VALIDATION_ERROR',
      errors: errors
    };
  }

  // 3. Check trùng lặp nội bộ (Ví dụ file excel có 2 dòng cùng mã 101)
  const uniqueCodes = new Set();
  const internalErrors = [];

  dataList.forEach((item, index) => {
    if (uniqueCodes.has(item.code)) {
      internalErrors.push({
        msg: `Dòng ${index + 1}: Mã "${item.code}" bị trùng lặp trong file excel.`
      });
    } else {
      uniqueCodes.add(item.code);
    }
  });

  if (internalErrors.length > 0) {
    return { error: 'VALIDATION_ERROR', errors: internalErrors };
  }

  // 4. Nếu mọi thứ sạch sẽ -> Mới thực hiện Insert
  try {
    const createdData = await Equipment.bulkCreate(dataList);
    return { data: createdData };
  } catch (err) {
    // Phòng hờ các lỗi SQL khác (sai kiểu dữ liệu, v.v.)
    throw err;
  }
};


module.exports = {
  getEquipmentById,
  getAllEquipments,
  createEquipment,
  bulkImportEquipments
};