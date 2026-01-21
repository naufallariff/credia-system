import { useState } from 'react';
import { Bell, Check, CheckCheck, Inbox, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { useNotifications, useMarkAsRead, useMarkAllRead } from '@/features/notification/use-notifications';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Badge } from '@/shared/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover";
import { cn } from '@/shared/lib/utils';

export const NotificationBell = () => {
    const [open, setOpen] = useState(false);

    // 1. Data Fetching
    const { data, isLoading } = useNotifications();
    const { mutate: markRead } = useMarkAsRead();
    const { mutate: markAllRead } = useMarkAllRead();

    // Safety check for array
    const notifications = Array.isArray(data) ? data : [];

    // Calculate unread
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleItemClick = (notification) => {
        if (!notification.is_read) {
            markRead(notification._id);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0 border-border bg-card shadow-lg" align="end">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-primary hover:text-primary/80"
                            onClick={() => markAllRead()}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" /> Mark all read
                        </Button>
                    )}
                </div>

                {/* Content List */}
                <ScrollArea className="h-[350px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 space-y-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="text-xs text-muted-foreground">Syncing...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        // Modern Empty State
                        <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
                            <div className="bg-muted/50 p-4 rounded-full mb-3">
                                <Inbox className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium text-foreground">All caught up!</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                You don't have any new notifications at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((item) => (
                                <button
                                    key={item._id}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-4 text-left transition-colors hover:bg-muted/50 border-b border-border last:border-0 relative",
                                        !item.is_read ? "bg-primary/5" : "bg-transparent"
                                    )}
                                    onClick={() => handleItemClick(item)}
                                >
                                    {/* Unread Indicator Dot */}
                                    {!item.is_read && (
                                        <span className="absolute left-2 top-5 h-2 w-2 rounded-full bg-primary" />
                                    )}

                                    <div className={cn("flex flex-col gap-1", !item.is_read ? "pl-3" : "")}>
                                        <div className="flex items-center justify-between w-full">
                                            <span className={cn("text-sm font-medium", !item.is_read ? "text-foreground" : "text-muted-foreground")}>
                                                {item.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {item.message}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer (Optional) */}
                <div className="p-2 border-t border-border bg-muted/30 text-center">
                    <Button variant="link" size="sm" className="text-xs text-muted-foreground h-auto py-1">
                        View history
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};