import { z } from 'zod';

// Schema for User Data Structure (Single Source of Truth)
export const UserSchema = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string().email(),
    username: z.string(),
    role: z.enum(['ADMIN', 'STAFF', 'CLIENT', 'SUPERADMIN']),
    status: z.enum(['ACTIVE', 'UNVERIFIED', 'SUSPENDED']),
    custom_id: z.string().optional(),
});

// Schema for Login Input Validation
export const LoginSchema = z.object({
    identifier: z.string().min(1, { message: "Username or Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
});

/**
 * Helper to check if user has specific permission
 * @param {object} user - User object
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export const checkPermission = (user, allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
};