const express = require('express');
const router = express.Router();
const { register, login, me, registerValidation, loginValidation } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register - Public registration (defaults to viewer role)
router.post('/register', registerValidation, register);

// POST /api/auth/login - Login and receive JWT
router.post('/login', loginValidation, login);

// GET /api/auth/me - Get current logged-in user profile
router.get('/me', authenticate, me);

module.exports = router;
