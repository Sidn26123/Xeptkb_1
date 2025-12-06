const express = require('express');
const router = express.Router();
const softContraistController = require('../controller/softContraistController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), softContraistController.getAllConstraints);
router.get('/:id', verifyToken, authorize('admin'), softContraistController.getConstraintById);
router.post('/', verifyToken, authorize('admin'), softContraistController.createConstraint);
router.put('/:id', verifyToken, authorize('admin'), softContraistController.updateConstraint);
router.delete('/:id', verifyToken, authorize('admin'), softContraistController.deleteConstraint);

module.exports = router;
