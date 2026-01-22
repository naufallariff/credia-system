const User = require('../models/User');
const { generateId } = require('../utils/idGenerator');
const { successResponse, errorResponse } = require('../utils/response');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../services/logService');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const generateResetToken = (id) => {
    return jwt.sign({ id, scope: 'RESET_ONLY' }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const register = async (req, res, next) => {
    try {
        const { name, email, username, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return errorResponse(res, 'Username or Email already exists', 400);
        }

        const user = await User.create({
            custom_id: generateId('USER'),
            name,
            email,
            username,
            password,
            role: 'LEAD',
            status: 'UNVERIFIED'
        });

        logActivity({ user, ip: req.ip, method: 'POST', originalUrl: req.originalUrl }, 'REGISTER', `New user registration: ${username}`, 'User', user._id);

        return successResponse(res, 'Registration successful. Please wait for Admin verification.', {
            id: user.custom_id,
            status: user.status
        }, 201);

    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { identifier, username, password } = req.body;
        const loginInput = identifier || username;

        if (!loginInput || !password) {
            return errorResponse(res, 'Please provide username/email and password', 400);
        }

        const user = await User.findOne({
            $or: [{ username: loginInput }, { email: loginInput }]
        }).select('+password');

        if (!user) return errorResponse(res, 'Invalid credentials', 401);

        if (user.status === 'UNVERIFIED') return errorResponse(res, 'Account is pending verification.', 403);
        if (['SUSPENDED', 'BANNED'].includes(user.status)) return errorResponse(res, 'Account access has been suspended.', 403);

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            user.login_attempts += 1;
            await user.save();
            return errorResponse(res, 'Invalid credentials', 401);
        }

        if (user.must_change_password) {
            const resetToken = generateResetToken(user._id);
            return successResponse(res, 'Password change required', {
                require_password_change: true,
                temp_token: resetToken,
                message: 'Please set a new password to continue.'
            });
        }

        user.last_login_at = new Date();
        user.login_attempts = 0;
        await user.save();

        const token = generateToken(user._id, user.role);

        req.user = user; 
        logActivity(req, 'LOGIN', `User ${user.username} logged in successfully`, 'User', user._id);

        return successResponse(res, 'Login successful', {
            token,
            user: {
                id: user._id,
                custom_id: user.custom_id,
                username: user.username,
                name: user.name,
                role: user.role,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password').lean();
        return successResponse(res, 'User profile retrieved', user);
    } catch (error) {
        next(error);
    }
};

const changeInitialPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.must_change_password) {
            return errorResponse(res, 'Action not valid. Account is already set up.', 400);
        }

        user.password = newPassword;
        user.must_change_password = false;
        await user.save();

        const newToken = generateToken(user._id, user.role);

        logActivity(req, 'UPDATE', 'User changed initial password', 'User', user._id);

        return successResponse(res, 'Password updated successfully. Logging you in...', {
            token: newToken,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, changeInitialPassword };