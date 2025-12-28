const GlobalConfig = require('../models/GlobalConfig');
const { sendResponse } = require('../utils/response');

const getConfig = async (req, res, next) => {
    try {
        const config = await GlobalConfig.findOne({ key: 'LOAN_RULES' }).lean();
        sendResponse(res, 200, true, 'System configuration retrieved', config);
    } catch (error) {
        next(error);
    }
};

const updateConfig = async (req, res, next) => {
    try {
        const { min_dp_percent, interest_tiers } = req.body;

        // Security: Only Superadmin/Admin
        if (!['SUPERADMIN', 'ADMIN'].includes(req.user.role)) {
            return sendResponse(res, 403, false, 'Unauthorized to change system rules');
        }

        const config = await GlobalConfig.findOneAndUpdate(
            { key: 'LOAN_RULES' },
            {
                min_dp_percent,
                interest_tiers,
                last_updated_by: req.user.id
            },
            { new: true, upsert: true }
        );

        sendResponse(res, 200, true, 'System configuration updated', config);
    } catch (error) {
        next(error);
    }
};

module.exports = { getConfig, updateConfig };