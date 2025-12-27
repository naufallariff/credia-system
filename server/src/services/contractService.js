const mongoose = require('mongoose');
const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const GlobalConfig = require('../models/GlobalConfig');
const User = require('../models/User'); // [FIX] Tambah ini untuk ambil nama client

// Helper: Format Rupiah Internal
const formatRupiah = (num) => 'Rp ' + num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

// Helper: Hitung selisih hari
const getDaysDifference = (start, end) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(start).setHours(0, 0, 0, 0);
    const endDate = new Date(end).setHours(0, 0, 0, 0);
    const diffDays = Math.round((endDate - startDate) / oneDay);
    return diffDays > 0 ? diffDays : 0;
};

// Helper: Standarisasi UTC Midnight
const setUTCMidnight = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

/**
 * Service: Create New Contract with Dynamic Rules
 */
const createContract = async (data, user) => {
    // 1. [FIX] Ambil Data Client Dulu (Wajib untuk client_name_snapshot)
    const clientDoc = await User.findById(data.clientId);
    if (!clientDoc) {
        throw new Error(`Client ID ${data.clientId} tidak ditemukan di database.`);
    }

    // 2. Ambil Aturan Main dari Database
    let config = await GlobalConfig.findOne({ key: 'LOAN_RULES' });
    if (!config) {
        config = {
            min_dp_percent: 0.2,
            interest_tiers: [{ min_price: 0, max_price: 1000000000, rate_percent: 12 }]
        };
    }

    // 3. Validasi DP
    const minDpAmount = data.otr * config.min_dp_percent;
    if (data.dpAmount < (minDpAmount - 100)) {
        const error = new Error(`DP kurang. Minimal ${(config.min_dp_percent * 100)}% (Rp ${formatRupiah(minDpAmount)})`);
        error.statusCode = 400;
        throw error;
    }

    // 4. Tentukan Bunga
    const tier = config.interest_tiers.find(t => data.otr >= t.min_price && data.otr <= t.max_price);
    const interestRatePercent = tier ? tier.rate_percent : 12;
    const interestRateDecimal = interestRatePercent / 100;

    // 5. Kalkulasi Finansial
    const principal = data.otr - data.dpAmount;
    const years = data.durationMonths / 12;
    const totalInterest = Math.ceil(principal * interestRateDecimal * years);
    const totalLoan = principal + totalInterest;

    const rawMonthly = totalLoan / data.durationMonths;
    const monthlyInstallment = Math.ceil(rawMonthly / 1000) * 1000;
    const finalTotalLoan = monthlyInstallment * data.durationMonths;

    // 6. Generate Roadmap
    const amortizationSchedule = [];
    let currentDate = new Date(data.startDate);

    for (let i = 1; i <= data.durationMonths; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        amortizationSchedule.push({
            month: i,
            due_date: setUTCMidnight(currentDate),
            amount: monthlyInstallment,
            status: 'UNPAID',
            penalty_estimated: 0,
            paid_at: null
        });
    }

    // 7. Simpan ke Database
    const newContract = await Contract.create({
        contract_no: data.contractNo,
        client: data.clientId,
        // [FIX] Masukkan nama snapshot yang wajib ada di schema
        client_name_snapshot: clientDoc.name || clientDoc.username,

        otr_price: data.otr,
        dp_amount: data.dpAmount,
        principal_amount: principal,
        interest_rate: interestRatePercent,
        duration_month: data.durationMonths,
        total_loan: finalTotalLoan,
        remaining_loan: finalTotalLoan,
        total_paid: 0,
        monthly_installment: monthlyInstallment,
        amortization: amortizationSchedule,
        status: 'ACTIVE',
        created_by: user._id
    });

    return newContract;
};

/**
 * Service: Get Contract Details
 */
const getContractDetail = async (contractNo, user) => {
    const contract = await Contract.findOne({ contract_no: contractNo })
        .populate('client', 'username email role name'); // Populate name juga

    if (!contract) throw new Error('Contract not found');

    if (user.role === 'CLIENT' && contract.client._id.toString() !== user._id.toString()) {
        throw new Error('Unauthorized access to this contract');
    }

    const today = new Date();
    const contractObj = contract.toObject();

    contractObj.amortization = contractObj.amortization.map(inst => {
        const isUnpaidOrLate = inst.status === 'UNPAID' || inst.status === 'LATE';
        const dueDate = new Date(inst.due_date);

        if (isUnpaidOrLate && dueDate < today) {
            inst.days_late = getDaysDifference(dueDate, today);
            inst.penalty_estimated = Math.ceil(inst.amount * 0.001 * inst.days_late);
            inst.status_display = 'OVERDUE';
        } else {
            inst.days_late = 0;
            inst.penalty_estimated = 0;
            inst.status_display = inst.status;
        }
        return inst;
    });

    const totalPenaltyDue = contractObj.amortization.reduce((acc, curr) => acc + (curr.penalty_estimated || 0), 0);

    return {
        ...contractObj,
        summary: {
            total_paid: contract.total_paid,
            remaining_loan: contract.remaining_loan,
            total_penalty_due: totalPenaltyDue
        }
    };
};

/**
 * Service: Pay Installment
 */
const payInstallment = async (contractNo, month, paymentData, officer) => {
    const contract = await Contract.findOne({ contract_no: contractNo });
    if (!contract) throw new Error('Contract not found');

    const idx = contract.amortization.findIndex(a => a.month === month);
    if (idx === -1) throw new Error('Installment month not found');

    const installment = contract.amortization[idx];

    if (installment.status === 'PAID') {
        throw new Error(`Installment month ${month} is already PAID.`);
    }

    const today = new Date();
    const dueDate = new Date(installment.due_date);
    let penaltyAmount = 0;

    if (today > dueDate) {
        const daysLate = getDaysDifference(dueDate, today);
        penaltyAmount = Math.ceil(installment.amount * 0.001 * daysLate);
    }

    const requiredAmount = installment.amount + penaltyAmount;
    if (paymentData.amountPaid < requiredAmount) {
        throw new Error(`Pembayaran kurang. Total tagihan: ${formatRupiah(requiredAmount)} (Denda: ${formatRupiah(penaltyAmount)})`);
    }

    contract.amortization[idx].status = 'PAID';
    contract.amortization[idx].paid_at = today;
    contract.amortization[idx].penalty_paid = penaltyAmount;

    contract.total_paid += installment.amount;
    contract.remaining_loan -= installment.amount;

    if (contract.remaining_loan <= 0) {
        contract.status = 'CLOSED';
    } else {
        contract.status = 'ACTIVE';
    }

    await contract.save();

    const transaction = await Transaction.create({
        contract_id: contract._id, // Relasi ID
        contract_no: contractNo,   // String Snapshot
        installment_month: month,
        amount_paid: installment.amount,
        penalty_paid: penaltyAmount,
        total_paid: paymentData.amountPaid,
        payment_method: paymentData.method || 'CASH',
        officer: officer._id
    });

    return {
        receipt_no: transaction._id,
        contract_no: contractNo,
        month_paid: month,
        status: 'SUCCESS',
        paid_amount: formatRupiah(installment.amount),
        penalty_paid: formatRupiah(penaltyAmount),
        remaining_loan: formatRupiah(contract.remaining_loan)
    };
};

module.exports = {
    createContract,
    getContractDetail,
    payInstallment
};