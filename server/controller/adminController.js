/**
 * Admin Controller
 * Định nghĩa các hàm xử lý cho admin
 */

function adminTest(req, res) {
  res.json({ msg: 'Admin API', user: req.user });
}

module.exports = {
  adminTest,
};