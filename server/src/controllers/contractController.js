const Contract = require('../models/Contract');
const User = require('../models/User');
const GlobalConfig = require('../models/GlobalConfig');
const ticketService = require('../services/ticketService');
const paymentService = require('../services/paymentService');
const { generateId } = require('../utils/idGenerator');
const { successResponse, errorResponse } = require('../utils/response'); // FIX: Import baru

// --- HELPER: Amortization Calculation ---
/**
 * Calculates loan schedule based on Flat Rate logic.
 * Formula: Total Interest = Principal * (Rate% / 100) * (Months / 12)
 */
const calculateAmortization = (principal, rate, months, startDateString) => {
    const schedule = [];

    // Flat Rate Calculation
    const totalInterest = Math.ceil(principal * (rate / 100) * (months / 12));
    const totalLoan = principal + totalInterest;

    // Round up monthly installment to nearest 1000 IDR for easier cash handling
    const monthlyInstallment = Math.ceil((totalLoan / months) / 1000) * 1000;

    // Recalculate true total based on rounded installment
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
 * Admin/Staff: View all (with search)
 * Client: View own contracts only
 */
const getContracts = async (req, res, next) => {
    try {
        const { role, id } = req.user;

        // Pagination Params
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        // Build Query
        let query = {};

        // Security: Client Scope
        if (role === 'CLIENT') {
            query.client = id;
        }

        // Search Capability (Regex)
        if (search) {
            query.$or = [
                { contract_no: { $regex: search, $options: 'i' } },
                { client_name_snapshot: { $regex: search, $options: 'i' } },
                { submission_id: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute Query
        const contracts = await Contract.find(query)
            .populate('client', 'name username email custom_id')
            .populate('created_by', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Metadata for Pagination
        const total = await Contract.countDocuments(query);

        return successResponse(res, 'Contracts retrieved successfully', {
            contracts,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_items: total,
                has_next: page * limit < total,
                has_prev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 2. CREATE CONTRACT (SUBMISSION)
 * Validates business rules (DP, Interest) before creating a Draft.
 */
const createContract = async (req, res, next) => {
    try {
        // Use snake_case to match Frontend Payload
        const { client_id, otr_price, dp_amount, duration_month, interest_rate } = req.body;

        // 1. Fetch Config for Validation
        const config = await GlobalConfig.findOne({ key: 'LOAN_RULES' });
        const rules = config || { min_dp_percent: 20 }; // Fallback 20%

        // 2. Validate DP
        const minDp = otr_price * (rules.min_dp_percent / 100);
        if (dp_amount < minDp) {
            return errorResponse(res, `Down Payment too low. Minimum ${rules.min_dp_percent}% (Rp ${minDp.toLocaleString()})`, 400);
        }

        // 3. Determine Interest Rate
        const finalRate = interest_rate || (otr_price > 50000000 ? 8 : 15);

        // 4. Calculate Financials
        const principal = otr_price - dp_amount;
        const calc = calculateAmortization(principal, finalRate, duration_month, new Date());

        // Fetch Client Snapshot
        const clientUser = await User.findById(client_id);
        if (!clientUser) return errorResponse(res, 'Client not found', 404);

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

            status: 'PENDING_ACTIVATION',
            amortization: calc.schedule
        });

        return successResponse(res, 'Contract submitted for approval', newContract, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * 3. GET DETAIL
 * Securely retrieves full contract details including amortization schedule.
 */
const getContractDetail = async (req, res, next) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate('client', 'name email custom_id phone address')
            .lean();

        if (!contract) return errorResponse(res, 'Contract not found', 404);

        // Security check for Client accessing others' data
        if (req.user.role === 'CLIENT' && contract.client._id.toString() !== req.user.id) {
            return errorResponse(res, 'Unauthorized access to this contract', 403);
        }

        return successResponse(res, 'Contract detail retrieved', contract);
    } catch (error) {
        next(error);
    }
};

/**
 * 4. UPDATE STATUS (ADMIN APPROVAL)
 * Handles APPROVE (Activate) or REJECT (Void) actions.
 */
const updateContractStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body; // action: 'APPROVE' | 'REJECT'

        // RBAC: Only Admin/Superadmin
        if (!['ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Unauthorized action. Admin role required.', 403);
        }

        const contract = await Contract.findById(id);
        if (!contract) return errorResponse(res, 'Contract not found', 404);

        if (contract.status !== 'PENDING_ACTIVATION') {
            return errorResponse(res, `Cannot process contract. Current status: ${contract.status}`, 400);
        }

        // Logic Branching
        if (action === 'APPROVE') {
            contract.status = 'ACTIVE';
            contract.contract_no = generateId('CONTRACT'); // Generate Official No
            contract.approved_by = req.user.id;
        } else if (action === 'REJECT') {
            contract.status = 'REJECTED';
            contract.void_reason = reason || 'Rejected by Admin';
            contract.approved_by = req.user.id;
        } else {
            return errorResponse(res, 'Invalid action type', 400);
        }

        await contract.save();

        return successResponse(res, `Contract has been ${action === 'APPROVE' ? 'Activated' : 'Rejected'}`, contract);
    } catch (error) {
        next(error);
    }
};

/**
 * 5. PAYMENT PROCESSING
 * Handles installment payments via staff input.
 */
const makePayment = async (req, res, next) => {
    try {
        const { month, amount } = req.body;
        const { id } = req.params;

        // Staff-only action
        if (!['STAFF', 'ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Only Staff can process payments', 403);
        }

        // Delegate to service for atomicity & validation
        const transaction = await paymentService.processPayment(id, month, amount, req.user.id);

        return successResponse(res, 'Payment processed successfully', transaction);
    } catch (error) {
        // Handle specific service errors
        if (error.message.includes('not found') || error.message.includes('already paid')) {
            return errorResponse(res, error.message, 400);
        }
        next(error);
    }
};

/**
 * 6. REQUEST CHANGE (TICKET)
 * Creates a modification ticket for sensitive data changes.
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

        return successResponse(res, 'Modification request ticket created', ticket, 201);
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