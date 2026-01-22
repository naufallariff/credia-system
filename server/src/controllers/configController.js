const GlobalConfig = require('../models/GlobalConfig');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/logService');

/**
 * Get Global Configuration
 * Retrieves system-wide settings like loan rules and interest tiers.
 */
const getConfig = async (req, res, next) => {
    try {
        const config = await GlobalConfig.findOne({ key: 'LOAN_RULES' }).lean();

        // Return default structure if config doesn't exist yet
        const data = config || {
            min_dp_percent: 20,
            interest_tiers: []
        };

        return successResponse(res, 'System configuration retrieved', data);
    } catch (error) {
        next(error);
    }
};

/**
 * Update Global Configuration
 * Restricted to Superadmin and Admin roles.
 */
const updateConfig = async (req, res, next) => {
    try {
        const { min_dp_percent, interest_tiers } = req.body;

        // Security: RBAC Check
        if (!['SUPERADMIN', 'ADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Unauthorized to change system rules', 403);
        }

        // Use findOneAndUpdate with upsert to handle initialization automatically
        const config = await GlobalConfig.findOneAndUpdate(
            { key: 'LOAN_RULES' },
            {
                min_dp_percent,
                interest_tiers,
                last_updated_by: req.user.id
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // LOGGING: CONFIGURATION CHANGE
        // Record details of what changed
        const changes = `DP: ${req.body.min_dp_percent}%, Interest Tiers Updated`;

        logActivity(
            req,
            'CONFIG_CHANGE',
            `System global configuration updated. ${changes}`,
            'GlobalConfig',
            config._id
        );

        return successResponse(res, 'System configuration updated successfully', config);
    } catch (error) {
        next(error);
    }
};

module.exports = { getConfig, updateConfig };