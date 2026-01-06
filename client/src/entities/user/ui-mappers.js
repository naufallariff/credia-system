/**
 * Maps user roles to UI badge styles.
 */
export const getRoleBadgeColor = (role) => {
    const map = {
        'SUPERADMIN': 'bg-violet-100 text-violet-700 border-violet-200',
        'ADMIN': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'STAFF': 'bg-blue-100 text-blue-700 border-blue-200',
        'CLIENT': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return map[role] || 'bg-slate-100 text-slate-600';
};

/**
 * Maps account status to color indicators.
 */
export const getUserStatusColor = (status) => {
    return status === 'ACTIVE'
        ? 'text-emerald-600 bg-emerald-50'
        : 'text-red-600 bg-red-50';
};