// middleware/auth.js
const { auth } = require('../utils/db');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token tidak tersedia' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.userId = decodedToken.uid; // ID pengguna Firebase
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};
