// // controller/timeSlotController.js
// const {
//     getAllTimeSlots,
//     getTimeSlotById,
//     createTimeSlot,
//     updateTimeSlot,
//     deleteTimeSlot,
// } = require('../services/timeSlotService');
//
// const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');
//
// // GET all
// exports.getAll = async (req, res) => {
//     try {
//         const data = await getAllTimeSlots();
//         res.json(new SuccessResponse(data, "Lấy danh sách TimeSlot thành công"));
//     } catch (err) {
//         res.status(500).json(new ErrorResponse(err.message));
//     }
// };
//
// // GET detail
// exports.getById = async (req, res) => {
//     try {
//         const item = await getTimeSlotById(req.params.id);
//         if (!item)
//             return res.status(404).json(new ErrorResponse("Không tìm thấy TimeSlot"));
//         res.json(new SuccessResponse(item, "Lấy chi tiết thành công"));
//     } catch (err) {
//         res.status(500).json(new ErrorResponse(err.message));
//     }
// };
//
// // POST create
// exports.create = async (req, res) => {
//     try {
//         const created = await createTimeSlot(req.body);
//         res.status(201).json(new SuccessResponse(created, "Tạo TimeSlot thành công"));
//     } catch (err) {
//         res.status(500).json(new ErrorResponse(err.message));
//     }
// };
//
// // PUT update
// exports.update = async (req, res) => {
//     try {
//         const updated = await updateTimeSlot(req.params.id, req.body);
//         if (!updated[0])
//             return res.status(404).json(new ErrorResponse("Không tìm thấy TimeSlot"));
//
//         res.json(new SuccessResponse({}, "Cập nhật thành công"));
//     } catch (err) {
//         res.status(500).json(new ErrorResponse(err.message));
//     }
// };
//
// // DELETE
// exports.delete = async (req, res) => {
//     try {
//         const deleted = await deleteTimeSlot(req.params.id);
//         if (!deleted)
//             return res.status(404).json(new ErrorResponse("Không tìm thấy TimeSlot"));
//
//         res.json(new SuccessResponse({}, "Xóa thành công"));
//     } catch (err) {
//         res.status(500).json(new ErrorResponse(err.message));
//     }
// };

const {
    getAllDays,
    getDayById,
    createDay,
    updateDay,
    deleteDay,
} = require('../services/dayService');

const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// GET all
exports.getAll = async (req, res) => {
    try {
        const data = await getAllDays();
        res.json(new SuccessResponse(data, "Lấy danh sách Day thành công"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

// GET detail
exports.getById = async (req, res) => {
    try {
        const item = await getDayById(req.params.id);
        if (!item)
            return res.status(404).json(new ErrorResponse("Không tìm thấy Day"));
        res.json(new SuccessResponse(item, "Lấy chi tiết thành công"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

// POST create
exports.create = async (req, res) => {
    try {
        const created = await createDay(req.body);
        res.status(201).json(new SuccessResponse(created, "Tạo Day thành công"));

    } catch (err) {
        console.log(err);
        res.status(500).json(new ErrorResponse(err.message));
    }
};

// PUT update
exports.update = async (req, res) => {
    try {
        const updated = await updateDay(req.params.id, req.body);
        if (!updated[0])
            return res.status(404).json(new ErrorResponse("Không tìm thấy Day"));

        res.json(new SuccessResponse({}, "Cập nhật thành công"));
    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
}

// DELETE
exports.delete = async (req, res) => {
    try {
        const deleted = await deleteDay(req.params.id);
        if (!deleted)
            return res.status(404).json(new ErrorResponse("Không tìm thấy Day"));

        res.json(new SuccessResponse({}, "Xóa thành công"));

    } catch (err) {
        res.status(500).json(new ErrorResponse(err.message));
    }
};

