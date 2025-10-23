const express = require('express');
const router = express.Router();
const trainingTypeController = require('../controller/trainingTypeController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
    createTrainingTypeValidator,
    updateTrainingTypeValidator
} = require('../validators/trainingTypeValidator');

router.get('/', verifyToken, authorize('admin'), trainingTypeController.getAllTrainingTypes);
router.get('/:id', verifyToken, authorize('admin'), trainingTypeController.getTrainingTypeById);
router.post(
    '/',
    verifyToken,
    authorize('admin'),
    createTrainingTypeValidator,
    validateRequest,
    trainingTypeController.createTrainingType
);
router.put(
    '/:id',
    verifyToken,
    authorize('admin'),
    updateTrainingTypeValidator,
    validateRequest,
    trainingTypeController.updateTrainingType
);
router.delete('/:id', verifyToken, authorize('admin'), trainingTypeController.deleteTrainingType);

module.exports = router;