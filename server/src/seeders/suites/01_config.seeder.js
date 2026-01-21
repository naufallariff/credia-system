const GlobalConfig = require('../../models/GlobalConfig');

const seedConfigs = async () => {
    console.log('[01] Seeding Global Configuration...');

    await GlobalConfig.create({
        key: 'LOAN_RULES',
        min_dp_percent: 20,
        interest_tiers: [
            { min_price: 0, max_price: 50000000, rate_percent: 15 }, // < 50jt
            { min_price: 50000001, max_price: 500000000, rate_percent: 12 }, // > 50jt
        ],
        company_balance: 1500000000 // Initial capital: 1.5 Billion IDR
    });
};

module.exports = seedConfigs;