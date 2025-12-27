const { z } = require('zod');
const contractService = require('../services/contractService');
const Contract = require('../models/Contract'); // [FIX] Wajib import ini untuk getAll/Update/Delete
const { successResponse, errorResponse } = require('../utils/response');

// --- 1. VALIDATION SCHEMAS ---

// [FIX] Schema disesuaikan dengan input dari Test Script & Service baru
const createContractSchema = z.object({
    contractNo: z.string().min(5).toUpperCase(),
    clientId: z.string().min(10, "Client ID wajib diisi"), // [NEW] Wajib ada
    otr: z.number().min(1000000),
    dpAmount: z.number().min(0), // [FIX] Ganti dpPercent jadi dpAmount
    durationMonths: z.number().int().positive(),
    startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
});

const payInstallmentSchema = z.object({
    amountPaid: z.number().positive(),
    method: z.enum(['CASH', 'TRANSFER']).optional()
});

// [FIX] Tambahkan schema ini karena dipanggil di function updateContract
const updateContractSchema = z.object({
    status: z.enum(['ACTIVE', 'CLOSED', 'LATE', 'VOID']).optional(),
    notes: z.string().optional()
});

// --- 2. CONTROLLER FUNCTIONS ---

/**
 * @desc    Pay specific installment
 * @route   POST /api/contracts/:contractNo/installments/:month/pay
 * @access  Private (Staff/Admin)
 */
const processPayment = async (req, res, next) => {
    try {
        const { contractNo, month } = req.params;

        // 1. Validasi Input Body
        const validation = payInstallmentSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, validation.error.errors[0].message, 400);
        }

        // 2. Call Service
        const result = await contractService.payInstallment(
            contractNo,
            parseInt(month),
            validation.data,
            req.user
        );

        return successResponse(res, result, 'Payment processed successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new loan contract
 * @route   POST /api/contracts
 * @access  Private (Admin/Staff only)
 */
const createNewContract = async (req, res, next) => {
    try {
        // 1. Validation
        const validation = createContractSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, validation.error.errors[0].message, 400);
        }

        // 2. Call Service
        const result = await contractService.createContract(validation.data, req.user);

        return successResponse(res, result, 'Contract created successfully', 201);
    } catch (error) {
        // Handle specific errors
        if (error.code === 11000) {
            return errorResponse(res, 'Contract Number already exists', 400);
        }
        // Gunakan next(error) agar ditangkap Global Error Handler di app.js
        // return errorResponse(res, error.message, 500); 
        next(error); // Lebih rapi pakai next()
    }
};

/**
 * @desc    Get All Contracts with Pagination & Filtering
 * @route   GET /api/contracts
 * @access  Private (Admin/Staff)
 */
const getAllContracts = async (req, res, next) => {
    try {
        // 1. Pagination Setup
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // 2. Filtering Setup
        let query = {};

        // Filter by Status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Search by Contract No
        if (req.query.search) {
            query.$or = [
                { contract_no: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        // Security: Jika Client, hanya bisa lihat kontrak sendiri
        if (req.user.role === 'CLIENT') {
            query.client = req.user._id;
        }

        // 3. Execution
        const total = await Contract.countDocuments(query);
        const contracts = await Contract.find(query)
            .populate('client', 'username role') // Join table user
            .skip(startIndex)
            .limit(limit)
            .sort({ created_at: -1 }); // Terbaru diatas

        // 4. Response with Metadata
        const pagination = {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_data: total,
            per_page: limit
        };

        return successResponse(res, { contracts, pagination }, 'Contracts retrieved');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update Contract (Restructure or Admin Edit)
 * @route   PATCH /api/contracts/:contractNo
 * @access  Private (Admin Only)
 */
const updateContract = async (req, res, next) => {
    try {
        const { contractNo } = req.params;

        // 1. Validation
        const validation = updateContractSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, validation.error.errors[0].message, 400);
        }

        // 2. Logic Direct DB Update (Idealnya pindah ke Service, tapi disini oke untuk Admin tool)
        const contract = await Contract.findOne({ contract_no: contractNo });
        if (!contract) return errorResponse(res, 'Contract not found', 404);

        // Update fields
        Object.assign(contract, validation.data);
        await contract.save();

        return successResponse(res, contract, 'Contract updated successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Soft Delete Contract (Void)
 * @route   DELETE /api/contracts/:contractNo
 * @access  Private (Admin Only)
 */
const deleteContract = async (req, res, next) => {
    try {
        const { contractNo } = req.params;

        // SOFT DELETE
        const contract = await Contract.findOneAndUpdate(
            { contract_no: contractNo },
            { status: 'VOID' },
            { new: true }
        );

        if (!contract) return errorResponse(res, 'Contract not found', 404);

        return successResponse(res, null, 'Contract has been voided');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get contract dashboard (Installments + Penalty)
 * @route   GET /api/contracts/:contractNo
 * @access  Private (Owner/Staff/Admin)
 */
const getContractDashboard = async (req, res, next) => {
    try {
        const { contractNo } = req.params;

        // Call Service
        const data = await contractService.getContractDetail(contractNo, req.user);

        return successResponse(res, data, 'Contract details retrieved');
    } catch (error) {
        // Handle error di Global Handler (app.js) saja agar konsisten
        next(error);
    }
};

module.exports = {
    createNewContract,
    getContractDashboard,
    getAllContracts,
    updateContract,
    deleteContract,
    processPayment
};