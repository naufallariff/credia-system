const GlobalConfig = require('../models/GlobalConfig');

const initConfig = async () => {
    const exists = await GlobalConfig.findOne({ key: 'LOAN_RULES' });
    if (!exists) {
        await GlobalConfig.create({
            key: 'LOAN_RULES',
            min_dp_percent: 0.2, // Minimal DP 20%
            interest_tiers: [
                { min_price: 0, max_price: 10000000, rate_percent: 20 }, // < 10jt Bunga 20%
                { min_price: 10000001, max_price: 50000000, rate_percent: 15 }, // 10-50jt Bunga 15%
                { min_price: 50000001, max_price: 1000000000, rate_percent: 12 }, // > 50jt Bunga 12%
            ]
        });
        console.log("✅ Default Loan Rules Initialized");
    }
};

module.exports = initConfig;