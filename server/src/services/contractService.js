const mongoose = require('mongoose');
const Contract = require('../models/Contract');
const User = require('../models/User');
const GlobalConfig = require('../models/GlobalConfig');
const { generateId } = require('../utils/idGenerator');

// Helper: Standardize UTC Midnight for consistency
const setUTCMidnight = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// Helper: High-Precision Amortization Calculator
const calculateAmortization = (principal, rate, months, startDateString) => {
    const schedule = [];
    // Flat Rate Calculation
    const totalInterest = Math.ceil(principal * (rate / 100) * (months / 12));
    const totalLoan = principal + totalInterest;
    
    // Rounding policy: Ceiling to nearest 1000 IDR
    const monthlyInstallment = Math.ceil((totalLoan / months) / 1000) * 1000;
    
    // Recalculate total based on rounded installment to prevent floating point drift
    const finalTotalLoan = monthlyInstallment * months;

    let currentDate = new Date(startDateString);

    for (let i = 1; i <= months; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        schedule.push({
            month: i,
            due_date: setUTCMidnight(currentDate),
            amount: monthlyInstallment,
            status: 'UNPAID',
            penalty_paid: 0,
            paid_at: null
        });
    }

    return { schedule, monthlyInstallment, totalLoan: finalTotalLoan };
};

/**
 * Service: Create Contract Submission
 * Generates a contract in 'PENDING_ACTIVATION' state.
 */
const createContractSubmission = async (staffId, data) => {
    // 1. Strict Client Verification
    const clientDoc = await User.findById(data.clientId).select('name username role status').lean();
    if (!clientDoc) throw { statusCode: 404, message: 'Client not found in registry.' };
    if (clientDoc.role !== 'CLIENT') throw { statusCode: 400, message: 'Selected user is not a Client.' };
    if (clientDoc.status !== 'ACTIVE') throw { statusCode: 403, message: 'Client account is not Active.' };

    // 2. Load System Configuration (Fail-Fast if missing)
    const config = await GlobalConfig.findOne({ key: 'LOAN_RULES' }).lean();
    if (!config) throw { statusCode: 500, message: 'CRITICAL: System Loan Rules configuration missing.' };

    // 3. Down Payment Validation
    const minDpAmount = data.otr * config.min_dp_percent;
    // Allow small floating point margin (100 IDR)
    if (data.dpAmount < (minDpAmount - 100)) {
        throw { 
            statusCode: 400, 
            message: `Down Payment insufficient. Minimum required: ${(config.min_dp_percent * 100)}%` 
        };
    }

    // 4. Determine Interest Rate Server-Side (Security enforcement)
    // Rule: > 50 Million = 8%, <= 50 Million = 15%
    const applicableTier = config.interest_tiers.find(t => data.otr >= t.min_price && data.otr <= t.max_price);
    const interestRate = applicableTier ? applicableTier.rate_percent : 15; // Default safe fallback

    // 5. Calculate Financials
    const principal = data.otr - data.dpAmount;
    const calculation = calculateAmortization(principal, interestRate, data.durationMonths, data.startDate);

    // 6. Persist to Database
    const newContract = await Contract.create({
        submission_id: generateId('SUBMISSION'),
        contract_no: null, // Explicitly null until Approved
        
        client: clientDoc._id,
        client_name_snapshot: clientDoc.name, // Snapshot for performance
        created_by: staffId,
        
        otr_price: data.otr,
        dp_amount: data.dpAmount,
        principal_amount: principal,
        interest_rate: interestRate,
        duration_month: data.durationMonths,
        
        monthly_installment: calculation.monthlyInstallment,
        total_loan: calculation.totalLoan,
        remaining_loan: calculation.totalLoan,
        
        status: 'PENDING_ACTIVATION',
        amortization: calculation.schedule
    });

    return newContract;
};

/**
 * Service: Get Contract Details with Dynamic Penalty Projection
 */
const getContractDetail = async (contractId, user) => {
    const contract = await Contract.findById(contractId)
        .populate('client', 'username email name custom_id')
        .populate('created_by', 'name')
        .lean();

    if (!contract) throw { statusCode: 404, message: 'Contract not found' };

    // Security: IDOR Protection
    if (user.role === 'CLIENT' && contract.client._id.toString() !== user.id) {
        throw { statusCode: 403, message: 'Access denied. You do not own this contract.' };
    }

    // Dynamic Projection (Read-Only)
    const today = new Date();
    const projection = contract.amortization.map(item => {
        let penaltyEstimated = 0;
        let daysLate = 0;
        let statusDisplay = item.status;

        if (['UNPAID', 'LATE'].includes(item.status)) {
            const dueDate = new Date(item.due_date);
            
            // Check strictly date-only comparison
            if (today.setHours(0,0,0,0) > dueDate.setHours(0,0,0,0)) {
                const diffTime = Math.abs(today - dueDate);
                daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                penaltyEstimated = Math.ceil(item.amount * 0.005 * daysLate); // 0.5% per day
                statusDisplay = 'OVERDUE';
            }
        }

        return {
            ...item,
            days_late: daysLate,
            penalty_estimated: penaltyEstimated,
            status_display: statusDisplay
        };
    });

    return {
        ...contract,
        amortization: projection
    };
};

module.exports = {
    createContractSubmission,
    getContractDetail
};