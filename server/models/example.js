// Ví dụ model kết nối MySQL bằng mysql2

const { db } = require('../config');

// Hàm lấy tất cả bản ghi từ bảng 'users'
function getAllUsers(callback) {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

module.exports = { getAllUsers };