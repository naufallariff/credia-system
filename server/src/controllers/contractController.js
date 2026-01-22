const Contract = require('../models/Contract');
const contractService = require('../services/contractService');
const ticketService = require('../services/ticketService');
const paymentService = require('../services/paymentService');
const { generateId } = require('../utils/idGenerator');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../services/logService');

const getContracts = async (req, res, next) => {
    try {
        const { role, id } = req.user;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        let query = {};

        if (role === 'CLIENT') {
            query.client = id;
        }

        if (search) {
            query.$or = [
                { contract_no: { $regex: search, $options: 'i' } },
                { client_name_snapshot: { $regex: search, $options: 'i' } },
                { submission_id: { $regex: search, $options: 'i' } }
            ];
        }

        const contracts = await Contract.find(query)
            .populate('client', 'name username email custom_id')
            .populate('created_by', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

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

const createContract = async (req, res, next) => {
    try {
        const submissionData = {
            clientId: req.body.client_id,
            otr: req.body.otr_price,
            dpAmount: req.body.dp_amount,
            durationMonths: req.body.duration_month,
            startDate: new Date()
        };

        const newContract = await contractService.createContractSubmission(req.user.id, submissionData);

        logActivity(
            req,
            'CREATE',
            `Created contract draft for client ${newContract.client_name_snapshot}`,
            'Contract',
            newContract._id
        );

        return successResponse(res, 'Contract submitted for approval', newContract, 201);
    } catch (error) {
        next(error);
    }
};

const getContractDetail = async (req, res, next) => {
    try {
        const contract = await contractService.getContractDetail(req.params.id, req.user);
        return successResponse(res, 'Contract detail retrieved', contract);
    } catch (error) {
        next(error);
    }
};

const updateContractStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;

        if (!['ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Unauthorized action', 403);
        }

        const contract = await Contract.findById(id);
        if (!contract) return errorResponse(res, 'Contract not found', 404);

        if (contract.status !== 'PENDING_ACTIVATION') {
            return errorResponse(res, `Cannot process contract. Status: ${contract.status}`, 400);
        }

        if (action === 'APPROVE') {
            contract.status = 'ACTIVE';
            contract.contract_no = generateId('CONTRACT');
            contract.approved_by = req.user.id;
        } else if (action === 'REJECT') {
            contract.status = 'REJECTED';
            contract.void_reason = reason || 'Rejected by Admin';
            contract.approved_by = req.user.id;
        } else {
            return errorResponse(res, 'Invalid action type', 400);
        }

        await contract.save();

        logActivity(
            req,
            action, // 'APPROVE' or 'REJECT'
            `Contract ${action}D by ${req.user.name}. Reason: ${reason || 'N/A'}`,
            'Contract',
            contract._id
        );

        return successResponse(res, `Contract ${action === 'APPROVE' ? 'Activated' : 'Rejected'}`, contract);
    } catch (error) {
        next(error);
    }
};

const makePayment = async (req, res, next) => {
    try {
        const { month, amount } = req.body;
        const { id } = req.params;

        if (!['STAFF', 'ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Permission denied', 403);
        }

        const transaction = await paymentService.processPayment(id, month, amount, req.user.id);

        logActivity(
            req,
            'PAYMENT',
            `Received payment Rp ${amount.toLocaleString()} for Month ${month}`,
            'Transaction',
            transaction._id
        );

        return successResponse(res, 'Payment processed', transaction);
    } catch (error) {
        next(error);
    }
};

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

        logActivity(
            req,
            'CREATE_TICKET',
            `Created modification ticket [${type}] for contract`,
            'ModificationTicket',
            ticket._id
        );

        return successResponse(res, 'Ticket created', ticket, 201);
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