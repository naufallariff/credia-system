import { Info, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

export const getNotificationStyle = (type) => {
    const styles = {
        'INFO': {
            icon: Info,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        'WARNING': {
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
        'SUCCESS': {
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
        },
        'ALERT': {
            icon: Bell,
            color: 'text-red-500',
            bg: 'bg-red-50',
        }
    };
    return styles[type] || styles['INFO'];
};