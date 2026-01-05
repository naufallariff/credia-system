/**
 * Maps contract status to UI color variants.
 * Used for Badges and Status Indicators.
 */
export const getStatusColor = (status) => {
    const map = {
        'PENDING_ACTIVATION': 'bg-amber-100 text-amber-700 border-amber-200',
        'ACTIVE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
        'DEFAULTED': 'bg-red-100 text-red-700 border-red-200',
        'VOID': 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return map[status] || 'bg-slate-100 text-slate-600';
};

/**
 * Maps contract status to user-friendly labels.
 */
export const getStatusLabel = (status) => {
    const map = {
        'PENDING_ACTIVATION': 'Pending Approval',
        'ACTIVE': 'Active',
        'COMPLETED': 'Paid Off',
        'DEFAULTED': 'Bad Debt',
        'VOID': 'Cancelled',
    };
    return map[status] || status;
};