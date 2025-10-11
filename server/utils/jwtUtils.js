const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const TOKEN_EXPIRE = process.env.JWT_EXPIRES_IN || '1d';

function generateToken(payload, expiresIn = TOKEN_EXPIRE) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function generateRefreshToken(payload, expiresIn = TOKEN_EXPIRE) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, generateRefreshToken, verifyToken };