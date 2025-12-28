const express = require('express');
const router = express.Router();
const { login, register, getMe, changeInitialPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public
router.post('/register', register);
router.post('/login', login);

// Protected
router.get('/me', protect, getMe);

// [NEW] Change Password Flow
router.post('/change-initial-password', protect, changeInitialPassword);

module.exports = router;