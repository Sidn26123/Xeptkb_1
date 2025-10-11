// Router cho admin site
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { adminTest } = require('../controller/adminController');

router.get('/', verifyToken, authorize('admin'), adminTest);

module.exports = router;