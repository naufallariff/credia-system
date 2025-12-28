const mongoose = require('mongoose');

const modificationTicketSchema = new mongoose.Schema({
    ticket_no: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    requester_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    approver_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    
    // Target Identification
    target_model: { 
        type: String, 
        enum: ['CONTRACT', 'PAYMENT', 'USER'], 
        required: true 
    },
    target_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },

    request_type: { 
        type: String, 
        enum: ['CREATE', 'UPDATE', 'VOID', 'DELETE', 'ACTIVATE'], 
        required: true 
    },
    
    // Data Snapshots (For Audit & Reversion)
    original_data: { type: Object },
    proposed_data: { type: Object },

    reason: { type: String, required: true },
    admin_note: { type: String },

    status: { 
        type: String, 
        enum: ['PENDING', 'APPROVED', 'REJECTED'], 
        default: 'PENDING',
        index: true
    },
    
    processed_at: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('ModificationTicket', modificationTicketSchema);