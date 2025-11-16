const express = require('express');
const router = express.Router();
const softContraistController = require('../controller/softContraistController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), softContraistController.getAllConstraints);
// router.get('/:id', verifyToken, authorize('admin'), softContraistController.getSoftContraistById);
// router.post('/', verifyToken, authorize('admin'), softContraistController.createSoftContraist);
// router.put('/:id', verifyToken, authorize('admin'), softContraistController.updateSoftContraist);
// router.delete('/:id', verifyToken, authorize('admin'), softContraistController.deleteSoftContraist);

module.exports = router;