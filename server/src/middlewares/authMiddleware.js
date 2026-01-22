const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

/**
 * Protect Middleware
 * Verifies JWT token and attaches the user context to the request.
 * Implements strict security checks for account status.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extract token
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify Token Signature
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Check if User still exists
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return errorResponse(res, 'User no longer exists', 401);
            }

            // 4. Security: Fail-Fast if Account is Suspended/Banned
            // This prevents suspended users from accessing ANY protected route immediately
            if (['SUSPENDED', 'BANNED'].includes(user.status)) {
                return errorResponse(res, 'Account access has been suspended or banned', 403);
            }

            // 5. Attach User to Request Context
            req.user = user;
            next();

        } catch (error) {
            console.error('[AUTH ERROR]', error.message);
            return errorResponse(res, 'Not authorized, token failed', 401);
        }
    }

    if (!token) {
        return errorResponse(res, 'Not authorized, no token provided', 401);
    }
};

/**
 * Role Guard Middleware
 * Restricts access to specific user roles.
 * Usage: authorize('ADMIN', 'SUPERADMIN')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'User context missing', 401);
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(res, `Access denied. Role '${req.user.role}' is not authorized.`, 403);
        }

        next();
    };
};

module.exports = { protect, authorize };