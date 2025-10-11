// Đọc biến môi trường và kết nối MySQL
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1); // Crash server nếu không kết nối được DB
  } else {
    console.log('Connected to MySQL');
  }
});

module.exports = { db };