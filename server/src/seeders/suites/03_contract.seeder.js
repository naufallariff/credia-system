const { faker } = require('@faker-js/faker');
const Contract = require('../../models/Contract');
const { generateAmortization } = require('../lib/math');

/**
 * Seeder for Contract entities.
 * Maps specific financial scenarios to the created user personas.
 * Implements "Two-ID Principle": Submissions get ID immediately, Contracts get ID only upon approval.
 */
const seedContracts = async (usersMap) => {
    console.log('[03] Seeding Contracts (Financial Scenarios)...');

    // Identify Key Personnel
    const admin = usersMap.admins.find(u => u.email === 'sarah.jenkins@credia.finance');
    const staff = usersMap.staff.find(u => u.email === 'emily.blunt@credia.finance');

    // Identify Client Personas
    const getClient = (email) => usersMap.clients.find(u => u.email === email);

    const clientClosed = getClient('william.thacker88@gmail.com');
    const clientActiveGood = getClient('julia.roberts@outlook.com');
    const clientActiveLate = getClient('hugh.grant@yahoo.com');
    const clientNew = getClient('emma.watson@live.com');
    const clientRejected = getClient('ryan.reynolds@icloud.com');
    const clientVoid = getClient('tom.holland@protonmail.com');

    const contracts = [];

    // --- SCENARIO 1: CLOSED / FULLY PAID (Historical Data) ---
    // Has Contract No.
    {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 14);
        const { schedule, monthlyInstallment } = generateAmortization(15000000, 11, 12, startDate);

        let totalPaid = 0;
        schedule.forEach(s => {
            s.status = 'PAID';
            s.paid_at = s.due_date;
            totalPaid += s.amount;
        });

        contracts.push(createContractObj({
            client: clientClosed,
            maker: staff,
            approver: admin,
            principal: 15000000,
            duration: 12,
            installment: monthlyInstallment,
            paid: totalPaid,
            status: 'CLOSED',
            schedule,
            contractNo: 'CTR-2024-CL-001'
        }));
    }

    // --- SCENARIO 2: ACTIVE / SMOOTH (Good Payer) ---
    // Has Contract No.
    {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        const { schedule, monthlyInstallment } = generateAmortization(45000000, 12, 24, startDate);

        let totalPaid = 0;
        for (let i = 0; i < 6; i++) {
            schedule[i].status = 'PAID';
            schedule[i].paid_at = schedule[i].due_date;
            totalPaid += schedule[i].amount;
        }

        contracts.push(createContractObj({
            client: clientActiveGood,
            maker: staff,
            approver: admin,
            principal: 45000000,
            duration: 24,
            installment: monthlyInstallment,
            paid: totalPaid,
            status: 'ACTIVE',
            schedule,
            contractNo: 'CTR-2025-AC-002'
        }));
    }

    // --- SCENARIO 3: ACTIVE / DELINQUENT (Late Payer) ---
    // Has Contract No.
    {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 5);
        const { schedule, monthlyInstallment } = generateAmortization(80000000, 14, 36, startDate);

        let totalPaid = 0;
        for (let i = 0; i < 2; i++) {
            schedule[i].status = 'PAID';
            schedule[i].paid_at = schedule[i].due_date;
            totalPaid += schedule[i].amount;
        }
        schedule[2].status = 'LATE';
        schedule[3].status = 'LATE';
        schedule[4].status = 'LATE';

        contracts.push(createContractObj({
            client: clientActiveLate,
            maker: staff,
            approver: admin,
            principal: 80000000,
            duration: 36,
            installment: monthlyInstallment,
            paid: totalPaid,
            status: 'ACTIVE',
            schedule,
            contractNo: 'CTR-2025-DL-003'
        }));
    }

    // --- SCENARIO 4: PENDING ACTIVATION (Approval Queue) ---
    // NO Contract No (Application Stage).
    {
        const { schedule, monthlyInstallment } = generateAmortization(25000000, 12, 12, new Date());
        const contract = createContractObj({
            client: clientNew,
            maker: staff,
            approver: null,
            principal: 25000000,
            duration: 12,
            installment: monthlyInstallment,
            paid: 0,
            status: 'PENDING_ACTIVATION',
            schedule,
            contractNo: undefined // Explicitly undefined
        });
        contract.submission_id = 'SUB-2026-NEW-004';
        contracts.push(contract);
    }

    // --- SCENARIO 5: REJECTED (Bad Credit) ---
    // NO Contract No (Rejected at Application Stage).
    {
        const { schedule, monthlyInstallment } = generateAmortization(120000000, 12, 48, new Date());
        const contract = createContractObj({
            client: clientRejected,
            maker: staff,
            approver: admin,
            principal: 120000000,
            duration: 48,
            installment: monthlyInstallment,
            paid: 0,
            status: 'REJECTED',
            schedule,
            contractNo: undefined // Explicitly undefined
        });
        contract.void_reason = "Applicant debt-to-income ratio exceeds 40%. High credit risk.";
        contracts.push(contract);
    }

    // --- SCENARIO 6: VOID (Administrative Error) ---
    // Has Contract No (Was active, then voided).
    {
        const { schedule, monthlyInstallment } = generateAmortization(10000000, 12, 6, new Date());
        const contract = createContractObj({
            client: clientVoid,
            maker: staff,
            approver: admin,
            principal: 10000000,
            duration: 6,
            installment: monthlyInstallment,
            paid: 0,
            status: 'VOID',
            schedule,
            contractNo: 'CTR-2026-VD-006'
        });
        contract.void_reason = "Duplicate application detected. Client requested cancellation.";
        contracts.push(contract);
    }

    // --- FILLER DATA (For Load Testing) ---
    // Pending applications have NO Contract No.
    for (let i = 0; i < 15; i++) {
        const client = usersMap.fillers[i];
        const principal = Number(faker.commerce.price({ min: 10000000, max: 60000000, dec: 0 }));
        const { schedule, monthlyInstallment } = generateAmortization(principal, 12, 12, new Date());

        const contract = createContractObj({
            client,
            maker: staff,
            approver: null,
            principal,
            duration: 12,
            installment: monthlyInstallment,
            paid: 0,
            status: 'PENDING_ACTIVATION',
            schedule,
            contractNo: undefined // Explicitly undefined
        });
        contract.submission_id = `SUB-FILL-${faker.string.alphanumeric(6).toUpperCase()}`;
        contracts.push(contract);
    }

    const createdContracts = await Contract.insertMany(contracts);
    return createdContracts;
};

// --- Helper Factory Function ---
const createContractObj = ({ client, maker, approver, principal, duration, installment, paid, status, schedule, contractNo }) => {
    const otr = Math.ceil(principal / 0.8); // Assuming 20% DP
    const dp = otr - principal;

    const baseObj = {
        submission_id: `SUB-${faker.string.alphanumeric(8).toUpperCase()}`,
        client: client._id,
        client_name_snapshot: client.name,
        created_by: maker._id,
        approved_by: approver ? approver._id : null,
        otr_price: otr,
        dp_amount: dp,
        principal_amount: principal,
        interest_rate: 12,
        duration_month: duration,
        monthly_installment: installment,
        total_loan: installment * duration,
        remaining_loan: (installment * duration) - paid,
        total_paid: paid,
        status: status,
        amortization: schedule,
        void_reason: null
    };

    // CONDITIONAL PROPERTY: Only add contract_no if it exists (is not undefined/null).
    // This ensures Mongoose/MongoDB Sparse Index works correctly (ignores document if field missing).
    if (contractNo) {
        baseObj.contract_no = contractNo;
    }

    return baseObj;
};

module.exports = seedContracts;