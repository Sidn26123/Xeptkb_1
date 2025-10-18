const express = require('express');
const router = express.Router();
const subjectRequiresEquipmentController = require('../controller/subjectRequiresEquipmentController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), subjectRequiresEquipmentController.getAllSubjectRequiresEquipments);
router.get('/:id', verifyToken, authorize('admin'), subjectRequiresEquipmentController.getSubjectRequiresEquipmentById);
router.post('/', verifyToken, authorize('admin'), subjectRequiresEquipmentController.createSubjectRequiresEquipment);
router.put('/:id', verifyToken, authorize('admin'), subjectRequiresEquipmentController.updateSubjectRequiresEquipment);
router.delete('/:id', verifyToken, authorize('admin'), subjectRequiresEquipmentController.deleteSubjectRequiresEquipment);

module.exports = router;