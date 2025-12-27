const mongoose = require('mongoose');

// Sub-Schema (Pengganti Installment.js)
const AmortizationSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    due_date: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['UNPAID', 'PAID', 'LATE', 'WAIVED'],
        default: 'UNPAID'
    },
    penalty_paid: { type: Number, default: 0 },
    paid_at: { type: Date, default: null }
}, { _id: false }); // Penting: _id false agar ringan

const ContractSchema = new mongoose.Schema({
    contract_no: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    client_name_snapshot: { type: String, required: true },

    // Financials
    otr_price: { type: Number, required: true },
    dp_amount: { type: Number, required: true },
    principal_amount: { type: Number, required: true },
    interest_rate: { type: Number, required: true },
    duration_month: { type: Number, required: true },
    monthly_installment: { type: Number, required: true },

    // Summary Fields (Cache untuk performa dashboard)
    total_loan: { type: Number, required: true },
    remaining_loan: { type: Number, required: true },
    total_paid: { type: Number, default: 0 },

    status: {
        type: String,
        enum: ['ACTIVE', 'CLOSED', 'LATE', 'VOID'],
        default: 'ACTIVE',
        index: true
    },

    // THE CORE: Embedded Schedule
    amortization: [AmortizationSchema],

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

ContractSchema.index({ client: 1, status: 1 });

module.exports = mongoose.model('Contract', ContractSchema);