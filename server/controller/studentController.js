/**
 * Student Controller
 * Định nghĩa các hàm xử lý cho student
 */

function studentTest(req, res) {
  res.json({ msg: 'Student API', user: req.user });
}

module.exports = {
  studentTest,
};