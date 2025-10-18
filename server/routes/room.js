const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), roomController.getAllRooms);
router.get('/:id', verifyToken, authorize('admin'), roomController.getRoomById);
router.post('/', verifyToken, authorize('admin'), roomController.createRoom);
router.put('/:id', verifyToken, authorize('admin'), roomController.updateRoom);
router.delete('/:id', verifyToken, authorize('admin'), roomController.deleteRoom);

module.exports = router;