const express = require('express');
const router = express.Router();
const { login, register, getMe, changeInitialPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public Access
router.post('/register', register); // Client Self-Registration
router.post('/login', login);

// Protected Access (All Authenticated Users)
router.get('/me', protect, getMe);
router.patch('/change-initial-password', protect, changeInitialPassword);

module.exports = router;