const cors = require("cors");

// Danh sách các domain Frontend / Localhost thông thường
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:8080,http://localhost:8081,http://127.0.0.1:5173")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // 1. Cho phép request không có origin (Server-to-Server, Postman, Mobile App)
    if (!origin) return callback(null, true);

    // 2. Cho phép request từ danh sách allowedOrigins (Localhost frontend)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. [MỚI] Cho phép request từ Extension (Edge/Chrome đều dùng chrome-extension://)
    if (origin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }

    // 4. Nếu không thỏa mãn điều kiện nào -> Chặn
    console.warn(`[CORS] Origin bị từ chối: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400
};

// Xuất ra middleware đã được cấu hình
module.exports = cors(corsOptions);