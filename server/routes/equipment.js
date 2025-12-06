const express = require('express');
const router = express.Router();
const equipmentController = require('../controller/equipmentController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { createEquipmentValidator, updateEquipmentValidator } = require('../validators/equipmentValidator');

router.get('/', verifyToken, authorize('admin'), equipmentController.getAllEquipments);
router.post('/', verifyToken, authorize('admin'), createEquipmentValidator, validateRequest, equipmentController.createEquipment);
router.post('/bulk', verifyToken, authorize('admin'), validateRequest, equipmentController.bulkImportEquipments);
router.get('/:id', verifyToken, authorize('admin'), equipmentController.getEquipmentById);
router.put('/:id', verifyToken, authorize('admin'), updateEquipmentValidator, validateRequest, equipmentController.updateEquipment);
router.delete('/:id', verifyToken, authorize('admin'), equipmentController.deleteEquipment);

module.exports = router;