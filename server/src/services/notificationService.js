const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send a notification to a specific user
 */
const sendNotification = async (recipientId, type, title, message, relatedId = null, actionLink = null) => {
    return await Notification.create({
        recipient_id: recipientId,
        type,
        title,
        message,
        related_id: relatedId,
        action_link: actionLink,
        is_read: false
    });
};

/**
 * Broadcast notification to all users with a specific role
 * Optimized with Promise.all for performance
 */
const notifyRole = async (role, type, title, message, relatedId = null, actionLink = null) => {
    // 1. Find all target users (lean for performance)
    const targets = await User.find({ role, status: 'ACTIVE' }).select('_id').lean();
    
    if (targets.length === 0) return;

    // 2. Prepare bulk payload
    const notifications = targets.map(user => ({
        recipient_id: user._id,
        type,
        title,
        message,
        related_id: relatedId,
        action_link: actionLink,
        is_read: false
    }));

    // 3. Bulk Insert
    return await Notification.insertMany(notifications);
};

/**
 * Get unread notifications for a user
 */
const getUserNotifications = async (userId, limit = 20) => {
    return await Notification.find({ recipient_id: userId })
        .sort({ created_at: -1 })
        .limit(limit)
        .lean();
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient_id: userId },
        { is_read: true },
        { new: true }
    );
    
    if (!notification) throw { statusCode: 404, message: 'Notification not found or access denied' };
    return notification;
};

/**
 * Mark all as read for a user
 */
const markAllAsRead = async (userId) => {
    await Notification.updateMany(
        { recipient_id: userId, is_read: false },
        { is_read: true }
    );
    return true;
};

module.exports = {
    sendNotification,
    notifyRole,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};