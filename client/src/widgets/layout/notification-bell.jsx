import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { useNotifications, useMarkAsRead, useMarkAllRead } from '@/features/notification/use-notifications';
import { getNotificationStyle } from '@/entities/notification/ui-mappers';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";

export const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const { data: notifications = [], isLoading } = useNotifications();
    const { mutate: markRead } = useMarkAsRead();
    const { mutate: markAllRead } = useMarkAllRead();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleItemClick = (notification) => {
        if (!notification.is_read) {
            markRead(notification._id);
        }
        // Logic to navigate can be added here based on notification.related_id
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary hover:bg-primary/5">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0 mr-4" align="end">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b">
                    <h4 className="font-semibold text-sm text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-primary hover:text-primary/80"
                            onClick={() => markAllRead()}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-xs text-slate-400">Loading updates...</div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((item) => {
                                const style = getNotificationStyle(item.type);
                                const Icon = style.icon;

                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => handleItemClick(item)}
                                        className={`
                      flex gap-3 p-4 text-left transition-colors cursor-pointer hover:bg-slate-50
                      ${!item.is_read ? 'bg-blue-50/30' : 'bg-white'}
                    `}
                                    >
                                        <div className={`mt-1 h-8 w-8 min-w-[2rem] rounded-full flex items-center justify-center ${style.bg}`}>
                                            <Icon size={14} className={style.color} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${!item.is_read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {item.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : 'Just now'}
                                            </p>
                                        </div>
                                        {!item.is_read && (
                                            <div className="mt-2">
                                                <span className="h-2 w-2 rounded-full bg-blue-500 block"></span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2 bg-slate-50 text-center">
                            <Button variant="link" size="sm" className="text-xs text-slate-500 h-auto">
                                View Transaction History
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
};