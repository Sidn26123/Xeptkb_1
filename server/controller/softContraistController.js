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

exports.updateConstraint = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, value } = req.body;

        const constraint = await Constraints.findByPk(id);
        if (!constraint) {
            return res.status(404).json(new ErrorResponse('Không tìm thấy ràng buộc', 404));


        }
        await constraint.update({ name, value });
        res.status(200).json(new SuccessResponse(constraint, 'Cập nhật ràng buộc thành công'));

    } catch (err) {
        console.error('Lỗi cập nhật ràng buộc:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
}

exports.getConstraintById = async (req, res) => {
    try {
        const { id } = req.params;
        const constraint = await Constraints.findByPk(id);
        if (!constraint) {
            return res.status(404).json(new ErrorResponse('Không tìm thấy ràng buộc', 404));
        }
        res.status(200).json(new SuccessResponse(constraint, 'Lấy thông tin ràng buộc thành công'));
    }

    catch (err) {
        console.error('Lỗi lấy thông tin ràng buộc:', err);
    }
}

exports.deleteConstraint = async (req, res) => {
    try {
        const { id } = req.params;
        const constraint = await Constraints.findByPk(id);
        if (!constraint) {
            return res.status(404).json(new ErrorResponse('Không tìm thấy ràng buộc', 404));

        }
        await constraint.destroy();
        res.status(200).json(new SuccessResponse(null, 'Xóa ràng buộc thành công'));
    }
    catch (err) {
        console.error('Lỗi xóa ràng buộc:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
}

// Tạo ràng buộc mới
exports.createConstraint = async (req, res) => {
    try {
        const { name, description, code, weight, type } = req.body;
        const newConstraint = await Constraints.create({ name, description, code, weight, type });
        res.status(201).json(new SuccessResponse(newConstraint, 'Tạo ràng buộc thành công', 201));


    }
    catch (err) {
        console.error('Lỗi tạos ràng buộc:', err);
        res.status(500).json(new ErrorResponse(err.message, 500));
    }
}

