// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;           // expect "Bearer <token>"
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token
    req.user = decoded;                                       // attach payload to req
    next();                                                   // pass control
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
