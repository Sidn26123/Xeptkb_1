const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { createRoomValidator, updateRoomValidator } = require('../validators/roomValidator');

router.get('/', verifyToken, authorize('admin'), roomController.getAllRooms);
router.get('/:id', verifyToken, authorize('admin'), roomController.getRoomById);
router.post('/', verifyToken, authorize('admin'), createRoomValidator, validateRequest, roomController.createRoom);
router.put('/:id', verifyToken, authorize('admin'), updateRoomValidator, validateRequest, roomController.updateRoom);
router.delete('/:id', verifyToken, authorize('admin'), roomController.deleteRoom);

module.exports = router;