const User = require('../models/User');
const { generateId } = require('../utils/idGenerator');
const { successResponse, errorResponse } = require('../utils/response'); // Updated import
const { sendNotification } = require('../services/notificationService');
const crypto = require('crypto');
const emailService = require('../services/emailService');

/**
 * Get All Users
 * Retrieval logic based on Role-Based Access Control (RBAC).
 * Admin retrieves all users; Staff retrieves Clients only.
 */
const getUsers = async (req, res, next) => {
    try {
        let query = {};

        // RBAC Filter
        if (req.user.role === 'STAFF') {
            query = { role: 'CLIENT' };
        } else if (req.user.role === 'CLIENT') {
            // Client is restricted to viewing their own profile
            query = { _id: req.user.id };
        }

        // Use lean() for performance optimization on read-only operations
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        return successResponse(res, 'User data retrieved successfully', users);
    } catch (error) {
        next(error);
    }
};

/**
 * Create User (Internal)
 * Allows Admin to manually onboard Staff or Clients.
 */
const createUser = async (req, res, next) => {
    try {
        const { name, email, username, password, role } = req.body;

        // Security: Privilege Escalation Prevention
        // Only Superadmin is authorized to create Admin or Superadmin accounts
        if (['ADMIN', 'SUPERADMIN'].includes(role) && req.user.role !== 'SUPERADMIN') {
            return errorResponse(res, 'Insufficient permissions to create administrative accounts', 403);
        }

        const newUser = await User.create({
            custom_id: generateId('USER'),
            name,
            email,
            username,
            password,
            role,
            status: 'ACTIVE',
            created_by: req.user.id
        });

        return successResponse(res, 'User created successfully', {
            id: newUser.custom_id,
            username: newUser.username
        }, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Approve Lead
 * Promotes a LEAD user to a specific role (CLIENT/STAFF) and generates credentials.
 */
const approveUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action, targetRole } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        if (action === 'REJECT') {
            user.status = 'BANNED';
            await user.save();
            return successResponse(res, 'User registration rejected');
        }

        // 1. Generate Secure Random Password
        // Format: Credia-[8 Hex Chars] to ensure complexity requirements
        const rawPassword = `Credia-${crypto.randomBytes(4).toString('hex')}`;

        // 2. Update User Data
        user.status = 'ACTIVE';
        user.role = targetRole || 'CLIENT';
        user.password = rawPassword; // Hashed automatically by Model pre-save hook
        user.must_change_password = true; // Enforce security policy

        await user.save();

        // 3. Send Email (Async operation)
        // We do not await this to prevent blocking the HTTP response, handled by the service queue
        emailService.sendWelcomeEmail(user.email, user.name, rawPassword).catch(console.error);

        // 4. Internal Notification
        await sendNotification(
            user._id,
            'SUCCESS',
            'Account Activated',
            'Your account is active. Check your email for login credentials.'
        );

        return successResponse(res, `User approved. Credentials sent to ${user.email}`);
    } catch (error) {
        next(error);
    }
};

module.exports = { getUsers, createUser, approveUser };