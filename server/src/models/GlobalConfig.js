const mongoose = require('mongoose');

const GlobalConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['LOAN_RULES'] // Kunci unik agar config tidak duplikat
    },
    min_dp_percent: {
        type: Number,
        required: true,
        default: 0.1 // Default 10%
    },
    // Admin bisa atur tier bunga di sini
    interest_tiers: [{
        min_price: Number,
        max_price: Number,
        rate_percent: Number // Misal 12%
    }],
    penalty_per_day_percent: {
        type: Number,
        default: 0.1 // 0.1% per hari
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('GlobalConfig', GlobalConfigSchema);