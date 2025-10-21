const express = require('express');
const router = express.Router();
const holidayActualController = require('../controller/holidayActualController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), holidayActualController.getAllHolidayActuals);
router.get('/semester/:semesterId', verifyToken, authorize('admin'), holidayActualController.getHolidaysBySemester);
router.get('/:id', verifyToken, authorize('admin'), holidayActualController.getHolidayActualById);
router.post('/', verifyToken, authorize('admin'), holidayActualController.createHolidayActual);
router.put('/:id', verifyToken, authorize('admin'), holidayActualController.updateHolidayActual);
router.delete('/:id', verifyToken, authorize('admin'), holidayActualController.deleteHolidayActual);

module.exports = router;