const crypto = require('crypto');

/**
 * Standardized API Response Builder
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {string} message - Human readable message
 * @param {object} data - Payload
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
    const responsePayload = {
        success,
        message,
        trace_id: crypto.randomBytes(8).toString('hex'), // For debugging logs
        timestamp: new Date().toISOString(),
        data
    };

    // Log 500 errors to console with colors for visibility
    if (statusCode >= 500) {
        console.error(`[ERROR] Trace: ${responsePayload.trace_id} | ${message}`.red.bold);
    }

    return res.status(statusCode).json(responsePayload);
};

module.exports = { sendResponse };