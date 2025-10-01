// Router cho teacher site
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ msg: 'Teacher API' });
});

module.exports = router;