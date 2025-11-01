const { verifyToken: jwtVerifyToken } = require('../utils/jwtUtils');
const bcrypt = require('bcrypt');
const { ErrorResponse } = require('../utils/responseUtils');

const AUTH_ENABLED = process.env.AUTH_ENABLED !== 'false';

// Middleware xác thực token
function verifyToken(req, res, next) {

  // Bypass auth cho môi trường phát triển nếu DEV_AUTH_BYPASS = 'true'
  if (process.env.DEV_AUTH_BYPASS) {
    console.log('[DEV AUTH BYPASS] Authentication bypassed for:', req.method, req.originalUrl);
    // Tạo user giả lập cho dev, có thể thay đổi tuỳ ý
    req.user = {
      username: 'admin',
      password:'123',
    };
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Thiếu token' });
  const user = jwtVerifyToken(token);
  if (!user) return res.status(403).json({ message: 'Token không hợp lệ' });
  req.user = user;
  next();
}

// Middleware xác thực mật khẩu
function verifyPassword(req, res, next) {
  const { password } = req.body;
  const user = req.user;
  bcrypt.compare(password, user.password, (err, match) => {
    if (err || !match) return res.status(401).json({ message: 'Sai mật khẩu' });
    next();
  });
}

//Middleware kiểm tra phân quyền
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ErrorResponse('Người dùng chưa đăng nhập hoặc chưa có quyền.', 403));
    }
    const userRole = String(req.user.role).toLowerCase();
    const allowedRoles = roles.map(role => String(role).toLowerCase());
    if (!allowedRoles.includes(userRole)) {
      return next(new ErrorResponse(
        `Truy cập bị từ chối: Quyền '${req.user.role}' không được phép truy cập tài nguyên này.`,
        403
      ));
    }
    next();
  };
}

module.exports = { verifyToken, verifyPassword, authorize };