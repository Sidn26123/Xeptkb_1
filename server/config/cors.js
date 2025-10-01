const cors = require("cors");

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:8080,http://localhost:8081")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Cho phép request nội bộ, Postman, server không có header Origin
    if (!origin) return callback(null, true);

    // Nếu origin nằm trong danh sách cho phép
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Nếu không, từ chối và log lại
    console.warn(`[CORS] Origin bị từ chối: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight requests 1 ngày
};

module.exports = cors(corsOptions);