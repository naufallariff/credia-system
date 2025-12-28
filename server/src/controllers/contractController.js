const Contract = require('../models/Contract');
const GlobalConfig = require('../models/GlobalConfig');
const ticketService = require('../services/ticketService');
const paymentService = require('../services/paymentService');
const { generateId } = require('../utils/idGenerator');
const { sendResponse } = require('../utils/response');

// Helper: Amortization Calculation
const calculateAmortization = (principal, rate, months, startDate) => {
    const schedule = [];
    const totalInterest = Math.ceil(principal * (rate / 100) * (months / 12));
    const totalLoan = principal + totalInterest;
    // Round to nearest 1000
    const monthlyInstallment = Math.ceil((totalLoan / months) / 1000) * 1000;

    // Recalculate accurate total based on rounded installment
    const finalTotalLoan = monthlyInstallment * months;

    let currentDate = new Date(startDate);

    for (let i = 1; i <= months; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        schedule.push({
            month: i,
            due_date: new Date(currentDate).setHours(0, 0, 0, 0), // UTC Midnight
            amount: monthlyInstallment,
            status: 'UNPAID',
            penalty_paid: 0,
            paid_at: null
        });
    }

    return { schedule, monthlyInstallment, totalLoan: finalTotalLoan };
};

/**
 * Submit New Contract
 * Creates a contract with 'PENDING_ACTIVATION' status.
 */
const createContract = async (req, res, next) => {
    try {
        const { clientId, otr, dpAmount, durationMonths, startDate } = req.body;

        // 1. Fetch Config for Validation
        const config = await GlobalConfig.findOne({ key: 'LOAN_RULES' });
        const rules = config || { min_dp_percent: 0.2 }; // Fallback

        // 2. Validate DP
        const minDp = otr * rules.min_dp_percent;
        if (dpAmount < minDp) {
            return sendResponse(res, 400, false, `Down Payment too low. Minimum ${(rules.min_dp_percent * 100)}%`);
        }

        // 3. Determine Interest Rate Server-Side (Security)
        // Logic: > 50jt = 8%, <= 50jt = 15%
        const rate = otr > 50000000 ? 8 : 15;

        // 4. Calculate Financials
        const principal = otr - dpAmount;
        const calc = calculateAmortization(principal, rate, durationMonths, startDate);

        // 5. Create Contract Record
        // Note: contract_no is deliberately NULL until approved
        const newContract = await Contract.create({
            submission_id: generateId('SUBMISSION'),
            client: clientId,
            client_name_snapshot: (await require('../models/User').findById(clientId)).name,
            created_by: req.user.id,

            otr_price: otr,
            dp_amount: dpAmount,
            principal_amount: principal,
            interest_rate: rate,
            duration_month: durationMonths,

            monthly_installment: calc.monthlyInstallment,
            total_loan: calc.totalLoan,
            remaining_loan: calc.totalLoan,

            status: 'PENDING_ACTIVATION',
            amortization: calc.schedule
        });

        sendResponse(res, 201, true, 'Contract submitted for approval', newContract);
    } catch (error) {
        next(error);
    }
};

const getContracts = async (req, res, next) => {
    try {
        let query = {};

        // RBAC: Client sees own, Staff/Admin sees all
        if (req.user.role === 'CLIENT') {
            query.client = req.user.id;
        }

        const contracts = await Contract.find(query)
            .populate('client', 'name username email custom_id')
            .sort({ createdAt: -1 })
            .lean();

        sendResponse(res, 200, true, 'Contracts retrieved', { contracts });
    } catch (error) {
        next(error);
    }
};

const getContractDetail = async (req, res, next) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate('client', 'name email custom_id')
            .lean();

        if (!contract) return sendResponse(res, 404, false, 'Contract not found');

        // Security check for Client
        if (req.user.role === 'CLIENT' && contract.client._id.toString() !== req.user.id) {
            return sendResponse(res, 403, false, 'Unauthorized access to this contract');
        }

        sendResponse(res, 200, true, 'Contract detail retrieved', contract);
    } catch (error) {
        next(error);
    }
};

/**
 * Process Installment Payment
 * Delegates to paymentService for strict validation.
 */
const makePayment = async (req, res, next) => {
    try {
        const { month, amount } = req.body;
        const { id } = req.params;

        // Staff-only action
        if (!['STAFF', 'ADMIN'].includes(req.user.role)) {
            return sendResponse(res, 403, false, 'Only Staff can process payments');
        }

        const transaction = await paymentService.processPayment(id, month, amount, req.user.id);

        sendResponse(res, 200, true, 'Payment processed successfully', transaction);
    } catch (error) {
        // Pass error with status code to global handler
        next(error);
    }
};

/**
 * Request Edit/Void (Maker-Checker)
 * Creates a ticket instead of modifying data directly.
 */
const requestChange = async (req, res, next) => {
    try {
        const { type, reason, proposedData } = req.body; // type: UPDATE | VOID
        const { id } = req.params;

        const ticket = await ticketService.createTicket(
            req.user.id,
            'CONTRACT',
            id,
            type,
            proposedData,
            reason
        );

        sendResponse(res, 201, true, 'Modification request ticket created', ticket);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createContract,
    getContracts,
    getContractDetail,
    makePayment,
    requestChange
};