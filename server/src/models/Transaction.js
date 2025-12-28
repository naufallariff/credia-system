const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    contract: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Contract', 
        required: true 
    },
    transaction_no: { type: String, required: true, unique: true }, // TXN-...
    
    // Financials
    amount_paid: { type: Number, required: true },
    period_month: { type: Number, required: true }, // Installment month (e.g., 5)
    penalty_included: { type: Number, default: 0 },
    payment_method: { type: String, enum: ['TRANSFER', 'CASH', 'VA'], default: 'TRANSFER' },
    
    // Audit & Integrity
    status: { 
        type: String, 
        enum: ['SUCCESS', 'VOID', 'DISPUTE'], 
        default: 'SUCCESS' 
    },
    void_reason: { type: String },
    ticket_reference: { type: String }, // Links to ModificationTicket if voided
    
    processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processed_at: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);