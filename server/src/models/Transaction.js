const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    // 1. Relasi Database (Untuk join/populate internal)
    contract_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        required: true,
        index: true
    },
    // 2. Data Snapshot (Untuk pencarian manual/kuitansi)
    contract_no: {
        type: String,
        required: true
    },
    installment_month: {
        type: Number,
        required: true
    },
    amount_paid: {
        type: Number,
        required: true
    },
    penalty_paid: {
        type: Number,
        default: 0
    },
    total_paid: {
        type: Number,
        required: true
    },
    payment_method: {
        type: String,
        enum: ['CASH', 'TRANSFER'],
        default: 'CASH'
    },
    payment_date: {
        type: Date,
        default: Date.now
    },
    officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: String
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false } 
});

module.exports = mongoose.model('Transaction', TransactionSchema);