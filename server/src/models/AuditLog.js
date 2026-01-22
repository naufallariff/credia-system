const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    // Actor: Who did it?
    actor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actor_role: { type: String, required: true },
    actor_name: { type: String, required: true }, // Snapshot in case user is deleted

    // Action: What happened?
    action_type: {
        type: String,
        required: true,
        enum: ['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'PAYMENT', 'CONFIG_CHANGE', 'VOID']
    },

    // Target: Which object was affected?
    target_model: { type: String, required: true }, // e.g., 'Contract', 'User', 'GlobalConfig'
    target_id: { type: String, required: true },

    // Details: Context/Reason
    description: { type: String, required: true },

    // Metadata: Forensic data
    metadata: {
        ip_address: String,
        user_agent: String,
        method: String,
        url: String
    },

    // Timestamp: When? (Auto-expire after 365 days)
    timestamp: { type: Date, default: Date.now, expires: '365d' }
});

// Indexing for faster search by Admins
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ actor_id: 1 });
auditLogSchema.index({ action_type: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);