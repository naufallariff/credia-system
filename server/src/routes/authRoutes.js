const express = require('express');
const router = express.Router();
const { loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', loginUser);
router.get('/me', protect, getMe); // Route ini diproteksi, butuh Token

module.exports = router;