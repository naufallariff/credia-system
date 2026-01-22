const AuditLog = require('../models/AuditLog');

/**
 * Records a system activity asynchronously.
 * Designed to be non-blocking to preserve API performance.
 * * @param {Object} req - Express request object (contains user, ip, etc.)
 * @param {String} actionType - Enum: LOGIN, CREATE, APPROVE, etc.
 * @param {String} description - Human readable description.
 * @param {String} targetModel - Affected entity name.
 * @param {String} targetId - Affected entity ID.
 */
const logActivity = (req, actionType, description, targetModel, targetId) => {
    // Safety check: specific system actions might not have req.user
    const actorId = req.user ? req.user._id : null;
    const actorRole = req.user ? req.user.role : 'SYSTEM';
    const actorName = req.user ? req.user.name : 'System Bot';

    const logEntry = {
        actor_id: actorId,
        actor_role: actorRole,
        actor_name: actorName,
        action_type: actionType,
        description: description,
        target_model: targetModel,
        target_id: targetId?.toString() || 'N/A',
        metadata: {
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent') || 'Unknown',
            method: req.method,
            url: req.originalUrl
        }
    };

    // Execute efficiently without awaiting result
    AuditLog.create(logEntry).catch(err => {
        console.error(`[AUDIT FAIL] Could not record log: ${err.message}`.red);
    });
};

module.exports = { logActivity };