const express = require('express');
const router = express.Router();
const dayController = require('../controller/dayController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), dayController.getAll);
router.get('/:id', verifyToken, authorize('admin'), dayController.getById);
router.post('/', verifyToken, authorize('admin'), dayController.create);
router.put('/:id', verifyToken, authorize('admin'), dayController.update);
router.delete('/:id', verifyToken, authorize('admin'), dayController.delete);

module.exports = router;