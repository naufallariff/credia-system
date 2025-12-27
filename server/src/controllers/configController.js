const GlobalConfig = require('../models/GlobalConfig');
const { successResponse } = require('../utils/response');

const updateRules = async (req, res, next) => {
    try {
        // Input Admin: { min_dp_percent: 0.25, interest_tiers: [...] }
        const updated = await GlobalConfig.findOneAndUpdate(
            { key: 'LOAN_RULES' },
            req.body,
            { new: true, runValidators: true }
        );
        successResponse(res, updated, "Aturan pinjaman berhasil diupdate Admin");
    } catch (error) {
        next(error);
    }
};

module.exports = { updateRules };