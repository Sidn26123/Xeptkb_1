const express = require('express');
const router = express.Router();
const equipmentController = require('../controller/equipmentController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), equipmentController.getAllEquipments);
router.get('/:id', verifyToken, authorize('admin'), equipmentController.getEquipmentById);
router.post('/', verifyToken, authorize('admin'), equipmentController.createEquipment);
router.put('/:id', verifyToken, authorize('admin'), equipmentController.updateEquipment);
router.delete('/:id', verifyToken, authorize('admin'), equipmentController.deleteEquipment);

module.exports = router;