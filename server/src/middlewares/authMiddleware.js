const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

/**
 * Protect Middleware
 * Memastikan request memiliki Header Authorization: Bearer <token> yang valid.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Ambil token dari header (buang kata 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifikasi tanda tangan token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Cek apakah user pemilik token masih ada di database
            // Gunakan .select('-password') agar password hash tidak ikut terbawa ke memory request
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return errorResponse(res, 'User not found or deactivated', 401);
            }

            // 4. Tempelkan objek user ke dalam request object agar bisa dipakai di controller
            req.user = user;
            next();
        } catch (error) {
            return errorResponse(res, 'Not authorized, token failed', 401, error);
        }
    }

    if (!token) {
        return errorResponse(res, 'Not authorized, no token provided', 401);
    }
};

/**
 * Role Guard Middleware
 * Membatasi akses hanya untuk role tertentu (misal: hanya ADMIN).
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return errorResponse(res, `User role '${req.user.role}' is not authorized to access this route`, 403);
        }
        next();
    };
};

module.exports = { protect, authorize };