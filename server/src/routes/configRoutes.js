const express = require('express');
const router = express.Router();
const { updateRules } = require('../controllers/configController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// HANYA ADMIN YANG BISA AKSES
router.put('/rules', protect, authorize('ADMIN'), updateRules);

module.exports = router;