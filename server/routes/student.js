// Router cho student site
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ msg: 'Student API' });
});

module.exports = router;