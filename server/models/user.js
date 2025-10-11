const { db } = require('../config/db');

// Lấy user theo username
function getUserByUsername(username, callback) {
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Lấy tất cả user
function getAllUsers(callback) {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

// Xác thực mật khẩu (so sánh trực tiếp)
function verifyPassword(inputPassword, userPassword) {
  return inputPassword === userPassword;
}

module.exports = { getUserByUsername, getAllUsers, verifyPassword };