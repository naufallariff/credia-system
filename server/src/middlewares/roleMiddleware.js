const { sendResponse } = require('../utils/response');

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendResponse(res, 401, false, 'Not authorized. No user context.');
        }

        if (!allowedRoles.includes(req.user.role)) {
            return sendResponse(res, 403, false, `Access denied. Role ${req.user.role} is not authorized.`);
        }

        next();
    };
};

module.exports = { authorize };