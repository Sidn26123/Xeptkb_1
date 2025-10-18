const express = require('express');
const router = express.Router();
const campusController = require('../controller/campusController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), campusController.getAllCampus);
router.get('/:id', verifyToken, authorize('admin'), campusController.getCampusById);
router.post('/', verifyToken, authorize('admin'), campusController.createCampus);
router.put('/:id', verifyToken, authorize('admin'), campusController.updateCampus);
router.delete('/:id', verifyToken, authorize('admin'), campusController.deleteCampus);

module.exports = router;