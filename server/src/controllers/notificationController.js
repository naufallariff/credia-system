const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/response');

/**
 * Get User Notifications
 * Retrieves notifications and calculates the unread count badge.
 */
const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user.id);

        // Calculate unread count for UI badge
        const unreadCount = notifications.filter(n => !n.is_read).length;

        return successResponse(res, 'Notifications retrieved', {
            unread_count: unreadCount,
            list: notifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark Notification as Read
 * Updates a specific notification status.
 */
const markRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id, req.user.id);

        return successResponse(res, 'Notification marked as read');
    } catch (error) {
        next(error);
    }
};

/**
 * Mark All as Read
 * Bulk update for user's notification inbox.
 */
const markAllRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user.id);

        return successResponse(res, 'All notifications marked as read');
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyNotifications, markRead, markAllRead };