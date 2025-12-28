const User = require('../models/User');
const { generateId } = require('../utils/idGenerator');
const { sendResponse } = require('../utils/response');
const { sendNotification } = require('../services/notificationService');
const crypto = require('crypto');
const emailService = require('../services/emailService');

/**
 * Get All Users
 * Admin sees all; Staff sees Clients only.
 */
const getUsers = async (req, res, next) => {
    try {
        let query = {};

        // RBAC Filter
        if (req.user.role === 'STAFF') {
            query = { role: 'CLIENT' };
        } else if (req.user.role === 'CLIENT') {
            // Client can only see themselves (or nothing)
            query = { _id: req.user.id };
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();
        sendResponse(res, 200, true, 'Data retrieved', users);
    } catch (error) {
        next(error);
    }
};

/**
 * Create User (Internal)
 * Used by Admin to manually add Staff or Clients
 */
const createUser = async (req, res, next) => {
    try {
        const { name, email, username, password, role } = req.body;

        // Security: Only Superadmin can create Admin/Superadmin
        if (['ADMIN', 'SUPERADMIN'].includes(role) && req.user.role !== 'SUPERADMIN') {
            return sendResponse(res, 403, false, 'Insufficient permissions to create Admin users.');
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

        sendResponse(res, 201, true, 'User created successfully', {
            id: newUser.custom_id,
            username: newUser.username
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve Lead
 * Converts a generic LEAD into a specific role (CLIENT/STAFF)
 */
const approveUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action, targetRole } = req.body;

        const user = await User.findById(id);
        if (!user) return sendResponse(res, 404, false, 'User not found');

        if (action === 'REJECT') {
            user.status = 'BANNED';
            await user.save();
            return sendResponse(res, 200, true, 'User registration rejected.');
        }

        // 1. Generate Secure Random Password (8 chars hex)
        // Format: Credia-[Random] agar memenuhi syarat password complexity
        const rawPassword = `Credia-${crypto.randomBytes(4).toString('hex')}`;

        // 2. Update User Data
        user.status = 'ACTIVE';
        user.role = targetRole || 'CLIENT';
        user.password = rawPassword; // Middleware 'pre save' di Model akan otomatis meng-hash ini
        user.must_change_password = true; // FORCE PASSWORD CHANGE
        
        await user.save();

        // 3. Send Email (Async, non-blocking)
        emailService.sendWelcomeEmail(user.email, user.name, rawPassword);

        // 4. Notification System (Internal)
        await sendNotification(
            user._id,
            'SUCCESS',
            'Account Activated',
            'Your account is active. Check your email for login credentials.'
        );

        sendResponse(res, 200, true, `User approved. Credentials sent to ${user.email}`);
    } catch (error) {
        next(error);
    }
};

module.exports = { getUsers, createUser, approveUser };