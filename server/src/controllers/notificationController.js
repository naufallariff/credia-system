const notificationService = require('../services/notificationService');
const { sendResponse } = require('../utils/response');

const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user.id);
        // Calculate unread count for badge UI
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        sendResponse(res, 200, true, 'Notifications retrieved', {
            unread_count: unreadCount,
            list: notifications
        });
    } catch (error) {
        next(error);
    }
};

const markRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id, req.user.id);
        sendResponse(res, 200, true, 'Notification marked as read');
    } catch (error) {
        next(error);
    }
};

const markAllRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        sendResponse(res, 200, true, 'All notifications marked as read');
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyNotifications, markRead, markAllRead };