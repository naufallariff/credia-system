const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

// 1. Definisikan Schema Validasi Input (Zod)
const loginSchema = z.object({
    username: z.string().min(3, "Username minimal 3 karakter"),
    password: z.string().min(1, "Password wajib diisi")
});

/**
 * Generate JWT Token
 * Token berlaku sesuai setting di .env (misal 15 menit/1 jam)
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '1d'
    });
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    try {
        // 2. Validasi Input Super Ketat
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            // Ambil pesan error pertama dari Zod
            const errorMessage = validation.error.errors[0].message;
            return errorResponse(res, errorMessage, 400);
        }

        const { username, password } = validation.data;

        // 3. Cari User (termasuk field password yang di-hidden)
        const user = await User.findOne({ username }).select('+password');

        // 4. Cek User & Password
        if (user && (await user.matchPassword(password))) {
            // Sukses Login
            const token = generateToken(user._id);

            return successResponse(res, {
                _id: user._id,
                username: user.username,
                role: user.role,
                token: token
            }, 'Login successful');
        } else {
            return errorResponse(res, 'Invalid credentials', 401);
        }
    } catch (error) {
        return errorResponse(res, 'Server Error', 500, error);
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    // Karena sudah lewat middleware 'protect', req.user sudah tersedia
    successResponse(res, req.user, 'User profile data');
};

module.exports = { loginUser, getMe };