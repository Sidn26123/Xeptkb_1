// authController.js - Base authentication & authorization
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwtUtils');
const { User, Student, Teacher } = require('../models');
const bcrypt = require('bcrypt');

// Đổi mật khẩu cho user đã đăng nhập
async function changePassword(req, res) {
  try {
    const userPayload = req.user; // from verifyToken
    const { current_password, new_password } = req.body || {};

    if (!current_password || !new_password) return res.status(400).json({ message: 'Thiếu trường mật khẩu' });
    if (new_password.length < 6) return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });

    const user = await User.findByPk(userPayload.id);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });

    const hash = await bcrypt.hash(new_password, 10);
    user.password = hash;
    await user.save();

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('auth.changePassword error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Lỗi hệ thống', details: err.message });
  }
}

// Đăng nhập: kiểm tra user, password, cấp token và refresh token
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // try to find user by username first
    let user = await User.findOne({ where: { username } });

    // fallback: if not found, try to find a student by email_school or email_personal and resolve the linked user
    if (!user) {
      const studentBySchoolEmail = await Student.findOne({ where: { email_school: username } });
      const studentByPersonalEmail = !studentBySchoolEmail ? await Student.findOne({ where: { email_personal: username } }) : null;
      const student = studentBySchoolEmail || studentByPersonalEmail;
      if (student && student.user_id) {
        user = await User.findByPk(student.user_id);
      }
    }

    if (!user) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    // load associated profile if exists (student/teacher). Admins don't need a profile.
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ where: { user_id: user.id }, attributes: { exclude: ['created_at', 'updated_at'] } });
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ where: { user_id: user.id }, attributes: { exclude: [] } });
    }

    const profileId = profile ? profile.id : null;
    const accessToken = generateToken({ id: user.id, role: user.role, profileId });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role },
      profile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống', details: error.message });
  }
}

// Refresh token: cấp lại access token mới
async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Thiếu refresh token' });
    const user = verifyToken(refreshToken);
    if (!user) return res.status(403).json({ message: 'Refresh token không hợp lệ' });
    const accessToken = generateToken({ id: user.id, role: user.role });
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống', details: error.message });
  }
}

// Đăng ký user mới
async function register(req, res) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ message: 'Thiếu thông tin đăng ký' });

    const existed = await User.findOne({ where: { username } });
    if (existed) return res.status(409).json({ message: 'Tài khoản đã tồn tại' });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash, role });
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi hệ thống', details: error.message });
  }
}

module.exports = { login, refreshToken, register, changePassword };