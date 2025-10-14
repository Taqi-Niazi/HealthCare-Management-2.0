// backend/routes/auth.js
const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);     // POST /api/auth/register
router.post('/login', login);           // POST /api/auth/login
router.get('/me', authMiddleware, me);  // protected route to get current user

module.exports = router;
