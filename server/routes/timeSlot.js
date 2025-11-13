// routes/timeSlotRoutes.js
const express = require('express');
const router = express.Router();
const timeSlotController = require('../controller/timeSlotController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get(
    '',
    verifyToken,
    authorize('admin'),
    timeSlotController.getAll
);

router.get(
    '/:id',
    verifyToken,
    authorize('admin'),
    timeSlotController.getById
);

router.post(
    '',
    verifyToken,
    authorize('admin'),
    timeSlotController.create
);

router.put(
    '/:id',
    verifyToken,
    authorize('admin'),
    timeSlotController.update
);

router.delete(
    '/:id',
    verifyToken,
    authorize('admin'),
    timeSlotController.delete
);

module.exports = router;
