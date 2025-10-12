// authController.js - Base authentication & authorization
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwtUtils');
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Đăng nhập: kiểm tra user, password, cấp token và refresh token
async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    const accessToken = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.json({ accessToken, refreshToken, role: user.role });
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

module.exports = { login, refreshToken, register };