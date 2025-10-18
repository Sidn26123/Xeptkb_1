const express = require('express');
const router = express.Router();
const buildingController = require('../controller/buildingController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), buildingController.getAllBuildings);
router.get('/:id', verifyToken, authorize('admin'), buildingController.getBuildingById);
router.post('/', verifyToken, authorize('admin'), buildingController.createBuilding);
router.put('/:id', verifyToken, authorize('admin'), buildingController.updateBuilding);
router.delete('/:id', verifyToken, authorize('admin'), buildingController.deleteBuilding);

module.exports = router;