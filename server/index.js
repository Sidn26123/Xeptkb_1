// Express server setup with required middleware and error handling

require('dotenv').config();
const express = require('express');
const cors = require('./config/cors');
const compression = require('compression');
const session = require('express-session');
const sequelize = require('./config/initSequelize');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/class');
const academicYearRoutes = require('./routes/academicYear');
const buildingRoutes = require('./routes/building');
const campusRoutes = require('./routes/campus');
const courseClassRoutes = require('./routes/courseClass');
const equipmentRoutes = require('./routes/equipment');
const facultyRoutes = require('./routes/faculty');
const holidayActualRoutes = require('./routes/holidayActual');
const holidayRuleRoutes = require('./routes/holidayRule');
const roomEquipmentRoutes = require('./routes/roomEquipment');
const roomRoutes = require('./routes/room');
const scheduleRoutes = require('./routes/schedule');
const semesterRoutes = require('./routes/semester');
const softContraistRoutes = require('./routes/softContraist');
const studentRoutes = require('./routes/student');
const subjectRequiresEquipmentRoutes = require('./routes/subjectRequiresEquipment');
const subjectRoutes = require('./routes/subject');
const teacherRoutes = require('./routes/teacher');
const teachingRoutes = require('./routes/teaching');
const trainingTypeRoutes = require('./routes/trainingType');
const mailRoutes = require('./routes/mail');
const app = express();
app.use(express.json());
app.use(cors);

app.use(compression());
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// API routes
app.use(API_PREFIX + '/', authRoutes);
app.use(API_PREFIX + '/admin', adminRoutes);
app.use(API_PREFIX + '/students', studentRoutes);
app.use(API_PREFIX + '/teachers', teacherRoutes);
app.use(API_PREFIX + '/classes', classRoutes);
app.use(API_PREFIX + '/academic-years', academicYearRoutes);
app.use(API_PREFIX + '/buildings', buildingRoutes);
app.use(API_PREFIX + '/campus', campusRoutes);
app.use(API_PREFIX + '/course-classes', courseClassRoutes);
app.use(API_PREFIX + '/equipments', equipmentRoutes);
app.use(API_PREFIX + '/faculties', facultyRoutes);
app.use(API_PREFIX + '/holiday-actuals', holidayActualRoutes);
app.use(API_PREFIX + '/holiday-rules', holidayRuleRoutes);
app.use(API_PREFIX + '/room-equipments', roomEquipmentRoutes);
app.use(API_PREFIX + '/rooms', roomRoutes);
app.use(API_PREFIX + '/schedules', scheduleRoutes);
app.use(API_PREFIX + '/semesters', semesterRoutes);
app.use(API_PREFIX + '/soft-contraists', softContraistRoutes);
app.use(API_PREFIX + '/subject-requires-equipments', subjectRequiresEquipmentRoutes);
app.use(API_PREFIX + '/subjects', subjectRoutes);
app.use(API_PREFIX + '/teachings', teachingRoutes);
app.use(API_PREFIX + '/training-types', trainingTypeRoutes);
// 404 handler for unknown routes
const ErrorResponse = require('./utils/responseUtils').ErrorResponse;
const errorHandler = require("./middleware/errorHandler");
app.use((req, res, next) => {
  // Forward to the global error handler with a 404 error
  const error = new ErrorResponse('Route not found', 404);
  next(error);
});

// Global Error Handler - MUST be last middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler Caught:', err.stack);
  let error = { ...err }; // Clone error to avoid modifying original
  error.message = err.message;

  // bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400); // Set status code to 400
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route (Invalid Token)';
    error = new ErrorResponse(message, 401);
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Not authorized to access this route (Token Expired)';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
});
app.use(errorHandler);
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Xử lý Uncaught Exception
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});



// Start server
const PORT = process.env.PORT || 5000;
// sequelize.authenticate()
//  .then(async () => {
//    console.log('Kết nối database thành công!');
//    await sequelize.sync({alter: true});
//    app.listen(PORT, () => {
//      console.log(`Server đang chạy tại http://localhost:${PORT}`);
//    });
//  })
//  .catch(err => {
//    console.error('Lỗi kết nối database:', err);
//    process.exit(1);
//  });


let server; // giữ lại server instance

sequelize.authenticate()
    .then(async () => {
      console.log('✅ Kết nối database thành công!');
      await sequelize.sync({ alter: true, force: false });
      server = app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ Lỗi kết nối database:', err);
      process.exit(1);
    });

// ===== Xử lý shutdown an toàn =====
function gracefulShutdown(signal) {
  console.log(`\n📥 Nhận tín hiệu ${signal}. Đang đóng server...`);
  if (server) {
    server.close(() => {
      console.log('✅ Server đã đóng port thành công.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Bắt các tín hiệu hệ thống
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl + C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // kill <pid>
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});
