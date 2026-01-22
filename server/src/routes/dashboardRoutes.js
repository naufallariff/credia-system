const express = require('express');
const router = express.Router();
const { getAdminStats, getStaffStats, getClientStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { errorResponse } = require('../utils/response');

router.use(protect);

// GET /api/dashboard/analytics
// Routes logic based on Role (Strategy Pattern)
router.get('/analytics', async (req, res, next) => {
    const role = req.user.role;

    switch (role) {
        case 'SUPERADMIN':
        case 'ADMIN':
            return getAdminStats(req, res, next);

        case 'STAFF':
            return getStaffStats(req, res, next);

        case 'CLIENT':
            return getClientStats(req, res, next);

        default:
            return errorResponse(res, 'Role not supported for analytics', 403);
    }
});

module.exports = router;