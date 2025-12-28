const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(protect);

// Read: Everyone needs to know the rules
router.get('/', getConfig);

// Write: Executives Only
router.put('/', authorize('SUPERADMIN', 'ADMIN'), updateConfig);

module.exports = router;