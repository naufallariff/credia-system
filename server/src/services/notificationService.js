const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Creates a single notification for a specific user.
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
 * Broadcasts a notification to all users holding a specific role.
 * Optimized with bulk insert for performance scaling.
 */
const notifyRole = async (role, type, title, message, relatedId = null, actionLink = null) => {
    // 1. Fetch Target Audience IDs
    const targets = await User.find({ role, status: 'ACTIVE' }).select('_id').lean();

    if (targets.length === 0) return;

    // 2. Construct Bulk Payload
    const notifications = targets.map(user => ({
        recipient_id: user._id,
        type,
        title,
        message,
        related_id: relatedId,
        action_link: actionLink,
        is_read: false
    }));

    // 3. Execute Bulk Write
    return await Notification.insertMany(notifications);
};

/**
 * Retrieves paginated notifications for the dashboard.
 */
const getUserNotifications = async (userId, limit = 20) => {
    return await Notification.find({ recipient_id: userId })
        .sort({ created_at: -1 })
        .limit(limit)
        .lean();
};

/**
 * Marks a single notification as read.
 */
const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient_id: userId },
        { is_read: true },
        { new: true }
    );

    if (!notification) throw { statusCode: 404, message: 'Notification not found' };
    return notification;
};

/**
 * Batch update: Marks all user notifications as read.
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