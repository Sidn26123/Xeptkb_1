const Subject = require('../models/Subjects');

async function getSubjectById(id) {
  return await Subject.findByPk(id);
}

async function getAllSubjects() {
  return await Subject.findAll();
}

async function createSubject(data) {
  return await Subject.create(data);
}
async function getAllSubjectIds() {
  try {
    // Sử dụng findAll với tùy chọn attributes để chỉ lấy cột 'id'
    const subjects = await Subject.findAll({
      attributes: ['id'], // Chỉ lấy cột 'id'
      raw: true,          // Trả về kết quả dưới dạng Object thuần (ít overhead hơn)
    });

    // Định dạng lại kết quả thành một mảng chỉ chứa các ID
    const subjectIdList = subjects.map(subject => subject.id);

    // Trả về danh sách IDs
    return subjectIdList;

  } catch (error) {
    console.error("Lỗi khi truy vấn Subject IDs:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}
module.exports = {
  getSubjectById,
  getAllSubjects,
  createSubject,
  getAllSubjectIds
};