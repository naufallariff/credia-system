const crypto = require('crypto');
require('colors'); // Ensure colors is loaded for string prototypes

/**
 * Internal function to construct the HTTP response.
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {string} message - Human readable message
 * @param {object} data - Payload or Error object
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
    const responsePayload = {
        success,
        message,
        trace_id: crypto.randomBytes(8).toString('hex'),
        timestamp: new Date().toISOString(),
        data
    };

    // Log server errors (5xx) to console for monitoring
    if (statusCode >= 500) {
        console.error(`[ERROR] Trace: ${responsePayload.trace_id} | ${message}`.red.bold);
        if (data) console.error(data);
    }

    return res.status(statusCode).json(responsePayload);
};

/**
 * Sends a standardized success response.
 * @param {Response} res 
 * @param {string} message 
 * @param {object} data 
 * @param {number} statusCode 
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
    return sendResponse(res, statusCode, true, message, data);
};

/**
 * Sends a standardized error response.
 * @param {Response} res 
 * @param {string} message 
 * @param {number} statusCode 
 * @param {object} error 
 */
const errorResponse = (res, message, statusCode = 500, error = null) => {
    return sendResponse(res, statusCode, false, message, error);
};

module.exports = { successResponse, errorResponse };