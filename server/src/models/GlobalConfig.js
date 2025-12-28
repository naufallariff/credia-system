const mongoose = require('mongoose');

const globalConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'LOAN_RULES'
    
    // Flexible Schema for different config types
    min_dp_percent: { type: Number },
    interest_tiers: [{
        min_price: Number,
        max_price: Number,
        rate_percent: Number
    }],
    company_balance: { type: Number, default: 0 }, // Simple Ledger
    
    last_updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('GlobalConfig', globalConfigSchema);