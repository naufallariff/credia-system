import { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import { Bell, Check } from 'lucide-react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // FIXED: Moved fetch logic inside useEffect to avoid dependency/render loops
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                // Ensure we safely handle the response structure
                const data = res.data?.data || [];
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            } catch (error) {
                // Silent error log for background polling
                console.error('Notification poll failed:', error.message);
            }
        };

        // 1. Call immediately on mount
        fetchNotifications();

        // 2. Set up interval for every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);

        // 3. Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []); // Empty dependency array is now valid and safe

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);

            // Optimistic Update (Update UI immediately without waiting for re-fetch)
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </button>

            {/* DROPDOWN MENU */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                        <span className="text-xs text-slate-400">{unreadCount} unread</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm ${!notif.is_read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                                {notif.title}
                                            </p>
                                            {!notif.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notif._id)}
                                                    className="text-indigo-400 hover:text-indigo-600"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <span className="text-[10px] text-slate-400 mt-2 block uppercase tracking-wide">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;