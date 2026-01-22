const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/response');

// Helper: Get start date of X months ago
const getStartDate = (monthsAgo) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
};

/**
 * SUPERADMIN & ADMIN ANALYTICS
 * - Revenue Chart (Year-over-Year / Monthly)
 * - Portfolio Health
 * - Audit Logs (Access Controlled)
 */
const getAdminStats = async (req, res, next) => {
    try {
        // 1. REVENUE CHART (Last 12 Months)
        const revenueStats = await Transaction.aggregate([
            {
                $match: {
                    status: 'SUCCESS',
                    createdAt: { $gte: getStartDate(12) }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    total: { $sum: "$amount_paid" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const formattedRevenue = revenueStats.map(item => ({
            period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            amount: item.total
        }));

        // 2. PORTFOLIO RISK (Active vs Bad Debt vs Closed)
        const riskStats = await Contract.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$remaining_loan" } } }
        ]);

        // 3. AUDIT LOGS (Security Standard)
        // Admin cannot see Superadmin's actions
        let logFilter = {};
        if (req.user.role === 'ADMIN') {
            logFilter = { actor_role: { $in: ['STAFF', 'CLIENT', 'ADMIN'] } };
        }

        const recentLogs = await AuditLog.find(logFilter)
            .sort({ timestamp: -1 })
            .limit(10)
            .select('-metadata') // Hide IP addresses from operational view
            .lean();

        // 4. KPI CARDS
        const totalClients = await User.countDocuments({ role: 'CLIENT', status: 'ACTIVE' });
        const pendingApprovals = await Contract.countDocuments({ status: 'PENDING_ACTIVATION' });

        return successResponse(res, 'Executive dashboard retrieved', {
            revenue_chart: formattedRevenue,
            portfolio_risk: riskStats,
            recent_logs: recentLogs,
            kpi: { total_clients: totalClients, pending_contracts: pendingApprovals }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * STAFF ANALYTICS
 * - Personal Performance
 * - To-Do Queue
 */
const getStaffStats = async (req, res, next) => {
    try {
        const staffId = req.user.id;
        const thisMonth = getStartDate(0);

        // Performance: Contracts created by me this month
        const mySales = await Contract.countDocuments({
            created_by: staffId,
            createdAt: { $gte: thisMonth }
        });

        // Queue: Transactions processed by me recently
        const recentWork = await Transaction.find({ processed_by: staffId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('contract', 'contract_no')
            .lean();

        return successResponse(res, 'Staff dashboard retrieved', {
            performance: { sales_this_month: mySales },
            recent_activity: recentWork
        });

    } catch (error) {
        next(error);
    }
};

/**
 * CLIENT ANALYTICS
 * - Loan Progress
 * - Payment History
 */
const getClientStats = async (req, res, next) => {
    try {
        // Find Active Loan
        const activeContract = await Contract.findOne({
            client: req.user.id,
            status: { $in: ['ACTIVE', 'LATE'] }
        })
            .select('contract_no total_loan remaining_loan monthly_installment next_due_date interest_rate')
            .lean();

        let progress = 0;
        let history = [];

        if (activeContract) {
            // Calculate Progress Percentage
            const paid = activeContract.total_loan - activeContract.remaining_loan;
            progress = Math.round((paid / activeContract.total_loan) * 100);

            // Fetch Payment History
            history = await Transaction.find({ contract: activeContract._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();
        }

        return successResponse(res, 'Client dashboard retrieved', {
            loan_summary: activeContract,
            loan_progress: progress,
            payment_history: history
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getAdminStats, getStaffStats, getClientStats };