const { z } = require('zod');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

const createUserSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    role: z.enum(['STAFF', 'CLIENT', 'ADMIN'])
});

/**
 * @desc    Create new User (Staff/Client)
 * @route   POST /api/users
 * @access  Private (Admin Only)
 */
const createUser = async (req, res, next) => {
    try {
        const validation = createUserSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, validation.error.errors[0].message, 400);
        }

        const { username, password, role } = validation.data;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return errorResponse(res, 'Username already exists', 400);
        }

        const user = await User.create({
            username,
            password,
            role
        });

        return successResponse(res, {
            id: user._id,
            username: user.username,
            role: user.role
        }, 'User created successfully', 201);

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get All Users
 * @route   GET /api/users
 * @access  Private (Admin Only)
 */
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ created_at: -1 });
        successResponse(res, users, 'Users retrieved');
    } catch (error) {
        next(error);
    }
};

module.exports = { createUser, getAllUsers };