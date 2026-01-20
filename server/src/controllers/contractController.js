const Contract = require('../models/Contract');
const User = require('../models/User'); // Import User model explicitly
const GlobalConfig = require('../models/GlobalConfig');
const ticketService = require('../services/ticketService');
const paymentService = require('../services/paymentService');
const { generateId } = require('../utils/idGenerator');
const { sendResponse } = require('../utils/response');

// --- HELPER: Amortization Calculation ---
const calculateAmortization = (principal, rate, months, startDateString) => {
    const schedule = [];
    // Convert Rate: % per year to decimal per month? 
    // Usually Simple Flat Rate: (Principal * Rate% * Years) / Months
    // Or Effective? Assuming Flat Rate based on your logic
    const totalInterest = Math.ceil(principal * (rate / 100) * (months / 12));
    const totalLoan = principal + totalInterest;

    // Round to nearest 1000 for aesthetics
    const monthlyInstallment = Math.ceil((totalLoan / months) / 1000) * 1000;

    // Recalculate accurate total based on rounded installment
    const finalTotalLoan = monthlyInstallment * months;

    let currentDate = new Date(startDateString || Date.now());

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
 * 1. GET CONTRACTS (WITH PAGINATION)
 * Fix: Added pagination logic to prevent server crash on large data
 */
const getContracts = async (req, res, next) => {
    try {
        const { role, id } = req.user;

        // Pagination Params (Default: Page 1, Limit 10)
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build Query
        let query = {};

        // Security: Client only sees their own data
        if (role === 'CLIENT') {
            query.client = id;
        }

        // Search Capability
        if (search) {
            query.$or = [
                { contract_no: { $regex: search, $options: 'i' } },
                { 'client_name_snapshot': { $regex: search, $options: 'i' } }
            ];
        }

        // Execute Query
        const contracts = await Contract.find(query)
            .populate('client', 'name username email custom_id')
            .populate('created_by', 'name')
            .sort({ created_at: -1 }) // Sort by newest
            .skip(skip)
            .limit(limit)
            .lean();

        // Metadata for Pagination
        const total = await Contract.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: contracts.length,
            data: {
                contracts,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_items: total,
                    has_next: page * limit < total,
                    has_prev: page > 1
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 2. CREATE CONTRACT
 * Fix: Matched variable names with Frontend (snake_case)
 */
const createContract = async (req, res, next) => {
    try {
        // Fix: Use snake_case to match Frontend Payload
        const { client_id, otr_price, dp_amount, duration_month, interest_rate } = req.body;

        // 1. Fetch Config for Validation
        const config = await GlobalConfig.findOne({ key: 'LOAN_RULES' });
        const rules = config || { min_dp_percent: 20 }; // Fallback 20%

        // 2. Validate DP
        const minDp = otr_price * (rules.min_dp_percent / 100);
        if (dp_amount < minDp) {
            return sendResponse(res, 400, false, `Down Payment too low. Minimum ${rules.min_dp_percent}%`);
        }

        // 3. Determine Interest Rate
        // Use input rate if provided (from frontend simulation), otherwise fallback to logic
        const finalRate = interest_rate || (otr_price > 50000000 ? 8 : 15);

        // 4. Calculate Financials
        const principal = otr_price - dp_amount;
        const calc = calculateAmortization(principal, finalRate, duration_month, new Date());

        // Fetch Client Name Snapshot
        const clientUser = await User.findById(client_id);
        if (!clientUser) return sendResponse(res, 404, false, 'Client not found');

        // 5. Create Contract Record
        const newContract = await Contract.create({
            submission_id: generateId('SUBMISSION'),
            client: client_id,
            client_name_snapshot: clientUser.name,
            created_by: req.user.id,

            otr_price: otr_price,
            dp_amount: dp_amount,
            principal_amount: principal,
            interest_rate: finalRate,
            duration_month: duration_month,

            monthly_installment: calc.monthlyInstallment,
            total_loan: calc.totalLoan,
            remaining_loan: calc.totalLoan,

            status: 'PENDING_ACTIVATION', // Waiting for Admin Approval
            amortization: calc.schedule
        });

        sendResponse(res, 201, true, 'Contract submitted for approval', newContract);
    } catch (error) {
        next(error);
    }
};

/**
 * 3. GET DETAIL
 * Fix: Keep Security Check
 */
const getContractDetail = async (req, res, next) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate('client', 'name email custom_id phone address') // Added phone/address if available
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
 * 4. UPDATE STATUS (ADMIN APPROVAL)
 * New: Handle PATCH /contracts/:id for Approval/Rejection
 */
const updateContractStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, approval_notes } = req.body; // status: 'ACTIVE' | 'VOID'

        // Only Admin/Superadmin
        if (!['ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
            return sendResponse(res, 403, false, 'Unauthorized action');
        }

        const contract = await Contract.findById(id);
        if (!contract) return sendResponse(res, 404, false, 'Contract not found');

        if (contract.status !== 'PENDING_ACTIVATION') {
            return sendResponse(res, 400, false, 'Contract is already processed');
        }

        // Update logic
        contract.status = status;
        contract.approved_by = req.user.id;
        contract.approval_date = new Date();
        if (approval_notes) contract.approval_notes = approval_notes;

        // If Approved, Generate Official Contract Number
        if (status === 'ACTIVE') {
            contract.contract_no = generateId('CONTRACT'); // e.g., CTR-202401-001
        }

        await contract.save();

        // TODO: Trigger Notification here (Next Step)

        sendResponse(res, 200, true, `Contract has been ${status.toLowerCase()}`, contract);
    } catch (error) {
        next(error);
    }
};

/**
 * 5. PAYMENT PROCESSING
 */
const makePayment = async (req, res, next) => {
    try {
        const { month, amount } = req.body;
        const { id } = req.params;

        // Staff-only action
        if (!['STAFF', 'ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
            return sendResponse(res, 403, false, 'Only Staff can process payments');
        }

        // Delegate to service for atomicity
        const transaction = await paymentService.processPayment(id, month, amount, req.user.id);

        sendResponse(res, 200, true, 'Payment processed successfully', transaction);
    } catch (error) {
        next(error);
    }
};

/**
 * 6. REQUEST CHANGE (TICKET)
 */
const requestChange = async (req, res, next) => {
    try {
        const { type, reason, proposedData } = req.body;
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
    updateContractStatus,
    makePayment,
    requestChange
};