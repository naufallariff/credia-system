const crypto = require('crypto');
require('colors'); // Extends String.prototype for console logging colors

/**
 * Standardized API Response Builder (Private)
 * Ensures consistent JSON structure across the entire application.
 * * Structure:
 * {
 * success: boolean,
 * message: string,
 * data: any,
 * meta: { trace_id: string, timestamp: string }
 * }
 * * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status flag
 * @param {string} message - Human-readable message
 * @param {object|null} data - Primary data payload or error details
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
    const traceId = crypto.randomBytes(8).toString('hex');

    const responsePayload = {
        success,
        message,
        data,
        meta: {
            trace_id: traceId,
            timestamp: new Date().toISOString()
        }
    };

    // Logging logic for monitoring (Critical errors only)
    if (statusCode >= 500) {
        console.error(`[SERVER ERROR] Trace: ${traceId} | ${message}`.red.bold);
        if (data) console.error(data);
    }

    return res.status(statusCode).json(responsePayload);
};

/**
 * Sends a standardized success response.
 * @param {Response} res - Express response object
 * @param {string} message - Success message
 * @param {object} [data=null] - The data requested
 * @param {number} [statusCode=200] - HTTP Status (default 200)
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
    return sendResponse(res, statusCode, true, message, data);
};

/**
 * Sends a standardized error response.
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP Status (default 500)
 * @param {object} [error=null] - Debug info or validation errors
 */
const errorResponse = (res, message, statusCode = 500, error = null) => {
    return sendResponse(res, statusCode, false, message, error);
};

module.exports = { successResponse, errorResponse };