// Router cho admin site
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ msg: 'Admin API' });
});

module.exports = router;