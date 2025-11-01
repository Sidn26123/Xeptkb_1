const express = require('express');
const router = express.Router();
const { sendMailController } = require('../controller/mailController');

// POST /api/mail/send
router.post('/send', sendMailController);

module.exports = router;
