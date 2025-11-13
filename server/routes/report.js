const express = require('express');
const router = express.Router();
const reportController = require('../controller/reportController');

router.get('/day', reportController.schedulesByDay);
router.get('/timeslot', reportController.schedulesByTimeSlot);
router.get('/instructor-conflicts', reportController.instructorConflicts);
router.get('/available-rooms', reportController.availableRooms);
router.get('/instructor-load', reportController.instructorLoad);
router.get('/empty-slots-week', reportController.emptySlotsByWeek);
router.get('/stat', reportController.getGenerationStats);
router.get('/penalty', reportController.getPenaltyAnalysis);
router.get('/fitness-trend', reportController.getFitnessTrend);
module.exports = router;
