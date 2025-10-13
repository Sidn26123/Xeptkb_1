const CourseClass = require('../models/CourseClass');

async function getCourseClassById(id) {
  return await CourseClass.findByPk(id);
}

async function getAllCourseClasses() {
  return await CourseClass.findAll();
}

async function createCourseClass(data) {
  return await CourseClass.create(data);
}

module.exports = {
  getCourseClassById,
  getAllCourseClasses,
  createCourseClass,
};