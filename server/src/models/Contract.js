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
    // Identifiers
    submission_id: { type: String, required: true, unique: true }, // Created on submit
    contract_no: { type: String, unique: true, sparse: true }, // Created on Approval
    
    // Relations
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client_name_snapshot: { type: String, required: true }, // For performance
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Staff
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin

    // Financials
    otr_price: { type: Number, required: true },
    dp_amount: { type: Number, required: true },
    principal_amount: { type: Number, required: true },
    interest_rate: { type: Number, required: true }, // Flat Yearly
    
    // Duration Logic
    duration_month: { type: Number, required: true }, // Stored as integer
    
    // Installment Logic
    monthly_installment: { type: Number, required: true },
    total_loan: { type: Number, required: true },
    remaining_loan: { type: Number, required: true },
    total_paid: { type: Number, default: 0 },

    // Lifecycle
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