const express = require('express');
const router = express.Router();
const holidayRuleController = require('../controller/holidayRuleController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), holidayRuleController.getAllHolidayRules);
router.get('/:id', verifyToken, authorize('admin'), holidayRuleController.getHolidayRuleById);
router.post('/', verifyToken, authorize('admin'), holidayRuleController.createHolidayRule);
router.put('/:id', verifyToken, authorize('admin'), holidayRuleController.updateHolidayRule);
router.delete('/:id', verifyToken, authorize('admin'), holidayRuleController.deleteHolidayRule);

module.exports = router;