const User = require('../models/User');
const { generateId } = require('../utils/idGenerator');
const { successResponse, errorResponse } = require('../utils/response'); // UPDATE: Import Wrapper
const jwt = require('jsonwebtoken');

/**
 * [HELPER] Generate Standard Access Token (Full Access)
 * Validity: 1 Day
 */
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

/**
 * [HELPER] Generate Temporary Reset Token (Restricted Access)
 * Validity: 15 Minutes. Used only for forcing password change.
 */
const generateResetToken = (id) => {
    return jwt.sign({ id, scope: 'RESET_ONLY' }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Public Registration
 * Creates a LEAD user pending verification by Admin.
 */
const register = async (req, res, next) => {
    try {
        const { name, email, username, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return errorResponse(res, 'Username or Email already exists', 400);
        }

        // Create as LEAD / UNVERIFIED
        const user = await User.create({
            custom_id: generateId('USER'),
            name,
            email,
            username,
            password,
            role: 'LEAD',
            status: 'UNVERIFIED'
        });

        return successResponse(res, 'Registration successful. Please wait for Admin verification.', {
            id: user.custom_id,
            status: user.status
        }, 201);

    } catch (error) {
        next(error);
    }
};

/**
 * Secure Login
 * Checks user status, handles forced password changes, and updates audit trails.
 */
const login = async (req, res, next) => {
    try {
        const { identifier, username, password } = req.body;

        // Support both field names for flexibility
        const loginInput = identifier || username;

        if (!loginInput || !password) {
            return errorResponse(res, 'Please provide username/email and password', 400);
        }

        // Explicitly select password as it is hidden by default in the model
        const user = await User.findOne({
            $or: [
                { username: loginInput },
                { email: loginInput }
            ]
        }).select('+password');

        if (!user) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        // Security: Check Account Status
        if (user.status === 'UNVERIFIED') {
            return errorResponse(res, 'Account is pending verification.', 403);
        }
        if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
            return errorResponse(res, 'Account access has been suspended.', 403);
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            // Security: Track failed login attempts
            user.login_attempts += 1;
            await user.save();
            return errorResponse(res, 'Invalid credentials', 401);
        }

        // Security: Force Password Change Check
        if (user.must_change_password) {
            const resetToken = generateResetToken(user._id);

            return successResponse(res, 'Password change required', {
                require_password_change: true,
                temp_token: resetToken, // This token can ONLY be used at /change-initial-password
                message: 'Please set a new password to continue.'
            });
        }

        // Audit: Update Login Statistics
        user.last_login_at = new Date();
        user.login_attempts = 0; // Reset on successful login
        await user.save();

        const token = generateToken(user._id, user.role);

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

/**
 * Get Current User Profile
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password').lean();
        return successResponse(res, 'User profile retrieved', user);
    } catch (error) {
        next(error);
    }
};

/**
 * Change Initial Password
 * This endpoint accepts the Temporary Reset Token and upgrades the user to full access.
 */
const changeInitialPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;

        // Middleware 'protect' has already verified the token and populated req.user
        const user = await User.findById(req.user.id);

        if (!user.must_change_password) {
            return errorResponse(res, 'Action not valid. Account is already set up.', 400);
        }

        // Update Password (Hashing is handled by Pre-Save hook in Model)
        user.password = newPassword;
        user.must_change_password = false; // Disable the flag
        await user.save();

        // Generate a new Full Access Token so the user can enter the dashboard immediately
        const newToken = generateToken(user._id, user.role);

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