const express = require('express');
const router = express.Router();
const buildingController = require('../controller/buildingController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', buildingController.getAllBuildings);
router.get('/:id', buildingController.getBuildingById);
router.post('/', buildingController.createBuilding);
router.put('/:id', verifyToken, authorize('admin'), buildingController.updateBuilding);
router.delete('/:id', verifyToken, authorize('admin'), buildingController.deleteBuilding);

module.exports = router;