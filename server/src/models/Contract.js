const mongoose = require('mongoose');

const amortizationSchema = new mongoose.Schema({
    month: Number,
    due_date: Date,
    amount: Number,
    status: { type: String, enum: ['UNPAID', 'PAID', 'LATE', 'WAIVED'], default: 'UNPAID' },
    penalty_paid: { type: Number, default: 0 },
    paid_at: Date
});

const contractSchema = new mongoose.Schema({
    // 1. Identifiers (Submission ID Wajib, Contract No Opsional)
    submission_id: { type: String, required: true, unique: true },

    // FIX: Hapus 'default: null'. Jika belum ada, jangan simpan field ini sama sekali.
    contract_no: { type: String, unique: true, sparse: true },

    // ... Sisa field (Client, Financials, dll) sama persis ...
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client_name_snapshot: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    otr_price: { type: Number, required: true },
    dp_amount: { type: Number, required: true },
    principal_amount: { type: Number, required: true },
    interest_rate: { type: Number, required: true },

    duration_month: { type: Number, required: true },
    monthly_installment: { type: Number, required: true },
    total_loan: { type: Number, required: true },
    remaining_loan: { type: Number, required: true },
    total_paid: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['DRAFT', 'PENDING_ACTIVATION', 'ACTIVE', 'LOCKED', 'CLOSED', 'VOID', 'REJECTED'],
        default: 'PENDING_ACTIVATION',
        index: true
    },

    void_reason: { type: String },
    amortization: [amortizationSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Contract', contractSchema);