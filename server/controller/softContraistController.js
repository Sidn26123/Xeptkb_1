// const Semester = require('../models/Semesters');
// const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
//
// // Lấy tất cả học kỳ
// exports.getAllSemesters = async (req, res) => {
//   try {
//     const semesters = await Semester.findAll({ order: [['start', 'ASC']] });
//     res.status(200).json(new SuccessResponse(semesters, 'Lấy danh sách học kỳ thành công'));
//   } catch (err) {
//     res.status(500).json(new ErrorResponse(err.message, 500));
//   }
// };

const Constraints = require('../models/Constraints');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// Lấy tất cả ràng buộc
exports.getAllConstraints = async (req, res) => {
    try {
        const constraints = await Constraints.findAll({ order: [['id', 'ASC']] });
        res.status(200).json(new SuccessResponse(constraints, 'Lấy danh sách ràng buộc thành công'));

    } catch (err) {
        console.error('Lỗi lấy danh sách ràng buộc:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
}