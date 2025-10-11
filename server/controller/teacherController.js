/**
 * Teacher Controller
 * Định nghĩa các hàm xử lý cho teacher
 */

function teacherTest(req, res) {
  res.json({ msg: 'Teacher API', user: req.user });
}

module.exports = {
  teacherTest,
};