const express = require('express');
const router = express.Router();
const roomEquipmentController = require('../controller/roomEquipmentController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), roomEquipmentController.getAllRoomEquipments);
router.get('/:id', verifyToken, authorize('admin'), roomEquipmentController.getRoomEquipmentById);
router.post('/', verifyToken, authorize('admin'), roomEquipmentController.createRoomEquipment);
router.put('/:id', verifyToken, authorize('admin'), roomEquipmentController.updateRoomEquipment);
router.delete('/:id', verifyToken, authorize('admin'), roomEquipmentController.deleteRoomEquipment);

module.exports = router;