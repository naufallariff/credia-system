const { errorResponse } = require('../utils/response');

/**
 * Global Error Handling Middleware
 * Catch all errors passed via next(error) and format them into standard JSON.
 * Hides stack traces in production for security.
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging (Server side only)
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${err.stack}`.red);
    }

    // 1. Mongoose Bad ObjectId (CastError)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid ID: ${err.value}`;
        return errorResponse(res, message, 404);
    }

    // 2. Mongoose Duplicate Key (E11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate value entered for field: ${field}. Please use another value.`;
        return errorResponse(res, message, 400);
    }

    // 3. Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return errorResponse(res, messages.join(', '), 400);
    }

    // 4. JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token. Please log in again.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired. Please log in again.', 401);
    }

    // 5. Default / Internal Server Error
    return errorResponse(res, error.message || 'Internal Server Error', error.statusCode || 500);
};

module.exports = errorHandler;