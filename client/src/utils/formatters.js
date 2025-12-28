/**
 * Format number to Indonesian Rupiah (IDR)
 * @param {number} value 
 * @returns {string} e.g., "Rp 15.000.000"
 */
export const formatRupiah = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

/**
 * Format ISO Date to readable string
 * @param {string} dateString 
 * @returns {string} e.g., "28 Dec 2025"
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

/**
 * Get color class based on status
 * @param {string} status 
 * @returns {string} Tailwind class string
 */
export const getStatusColor = (status) => {
    const colors = {
        ACTIVE: 'bg-green-100 text-green-700 border-green-200',
        PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
        PENDING_ACTIVATION: 'bg-blue-100 text-blue-700 border-blue-200',
        REJECTED: 'bg-red-100 text-red-700 border-red-200',
        CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
        VOID: 'bg-gray-100 text-gray-500 border-gray-200 decoration-line-through',
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
};