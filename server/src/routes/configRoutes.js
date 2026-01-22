const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Read: Semua user butuh baca config (untuk hitung simulasi di frontend)
router.get('/', getConfig);

// Write: HANYA SUPERADMIN (Owner) yang boleh ubah bunga/denda.
// Admin biasa tidak boleh ubah ini untuk mencegah kecurangan.
router.put('/', authorize('SUPERADMIN'), updateConfig);

module.exports = router;