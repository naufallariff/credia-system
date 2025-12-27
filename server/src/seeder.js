const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const Contract = require('./models/Contract');
const Transaction = require('./models/Transaction');
const GlobalConfig = require('./models/GlobalConfig');

// Load env vars
dotenv.config();

// Connect DB
mongoose.connect(process.env.MONGO_URI);

/**
 * HELPER: UTC Midnight Standardizer
 * Ensures all dates are stored at 00:00:00.000 UTC to prevent timezone shifts
 */
const setUTCMidnight = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

/**
 * HELPER: Smart Amortization Generator
 * Simulates history based on start date. 
 * If the month has passed, it marks it as PAID (unless forced otherwise).
 */
const generateSmartSchedule = (principal, rate, months, startDateString, isBadClient = false) => {
    const schedule = [];

    // Financial Calculation (Flat Yearly)
    const totalInterest = Math.ceil(principal * (rate / 100) * (months / 12));
    const totalLoan = principal + totalInterest;

    // Rounding up to nearest 1000 IDR for professional billing
    const monthlyInstallment = Math.ceil((totalLoan / months) / 1000) * 1000;

    // Recalculate total loan based on rounded installment for precision
    const finalTotalLoan = monthlyInstallment * months;

    let currentDate = new Date(startDateString);
    const today = new Date();
    let totalPaid = 0;

    for (let i = 1; i <= months; i++) {
        // Increment month
        currentDate.setMonth(currentDate.getMonth() + 1);
        const dueDate = setUTCMidnight(currentDate);

        // Determine Status based on Time
        let status = 'UNPAID';
        let paidAt = null;

        // Logic: If due date is in the past
        if (dueDate < today) {
            if (isBadClient) {
                // Scenario: Client stops paying after month 3
                if (i <= 3) {
                    status = 'PAID';
                    paidAt = dueDate; // Paid on time
                    totalPaid += monthlyInstallment;
                } else {
                    status = 'LATE'; // Past due and not paid
                }
            } else {
                // Scenario: Good Client (Paid everything in the past)
                status = 'PAID';
                paidAt = dueDate;
                totalPaid += monthlyInstallment;
            }
        }

        schedule.push({
            month: i,
            due_date: dueDate,
            amount: monthlyInstallment,
            status: status,
            penalty_paid: 0,
            paid_at: paidAt
        });
    }

    return {
        schedule,
        monthlyInstallment,
        totalLoan: finalTotalLoan,
        totalPaid,
        remainingLoan: finalTotalLoan - totalPaid
    };
};

const importData = async () => {
    try {
        console.log('[INFO] Cleaning Database...'.red.inverse);
        await User.deleteMany();
        await Contract.deleteMany();
        await Transaction.deleteMany();
        await GlobalConfig.deleteMany();

        console.log('[INFO] Injecting Global Configuration...'.blue);
        // Market Standard Rules 2025
        await GlobalConfig.create({
            key: 'LOAN_RULES',
            min_dp_percent: 0.20, // 20% Standard OJK/Leasing
            interest_tiers: [
                { min_price: 0, max_price: 50000000, rate_percent: 15 },    // Motorcycles (High Risk): 15%
                { min_price: 50000001, max_price: 1000000000, rate_percent: 8 } // Cars (Medium Risk): 8%
            ]
        });

        console.log('[INFO] Creating Professional Users...'.green);
        const users = await User.create([
            // 1. Administrator (IT / Finance Head)
            {
                username: 'sysadmin.finance',
                email: 'admin@credia.id',
                password: 'CrediaAdmin#2025!', // Strong Password
                role: 'ADMIN',
                name: 'Administrator System'
            },
            // 2. Staff (Credit Marketing Officer)
            {
                username: 'staff.jakarta',
                email: 'staff.jkt@credia.id',
                password: 'StaffAccess@123',
                role: 'STAFF',
                name: 'Rian Hidayat'
            },
            // 3. Client 1 (Good History - Employee)
            {
                username: 'andri.wicaksono',
                email: 'andri.wicak@gmail.com',
                password: 'AndriUser#88',
                role: 'CLIENT',
                name: 'Andri Wicaksono'
            },
            // 4. Client 2 (Bad History - Entrepreneur)
            {
                username: 'budi.santoso',
                email: 'budisan.jaya@yahoo.com',
                password: 'BudiSan_99!',
                role: 'CLIENT',
                name: 'Budi Santoso'
            }
        ]);

        const [admin, staff, clientGood, clientBad] = users.map(u => u._id);

        console.log('[INFO] Generating Contracts & Amortization Schedules...'.green);

        // --- CASE 1: TOYOTA AVANZA (Good Client) ---
        // Scenario: Started 6 months ago, Paying smoothly.
        const otrCar = 230000000; // 230 Million
        const dpCar = 50000000;   // 50 Million
        const principalCar = otrCar - dpCar;

        // Start date: 6 months ago
        const dateCar = new Date();
        dateCar.setMonth(dateCar.getMonth() - 6);

        const calcCar = generateSmartSchedule(
            principalCar,
            8,  // 8% Interest for Cars
            36, // 3 Years Tenor
            dateCar.toISOString(),
            false // Good Client
        );

        // --- CASE 2: HONDA PCX 160 (Bad Client) ---
        // Scenario: Started 5 months ago, Paid first 3 months, now delinquent (Late).
        const otrMotor = 32500000; // 32.5 Million
        const dpMotor = 7500000;   // 7.5 Million
        const principalMotor = otrMotor - dpMotor;

        const dateMotor = new Date();
        dateMotor.setMonth(dateMotor.getMonth() - 5);

        const calcMotor = generateSmartSchedule(
            principalMotor,
            15, // 15% Interest for Motorcycles
            12, // 1 Year Tenor
            dateMotor.toISOString(),
            true // Bad Client (Trigger LATE status)
        );

        // --- CASE 3: YAMAHA NMAX (New Contract) ---
        // Scenario: Started Today. No payments yet.
        const otrNew = 31000000;
        const dpNew = 7000000;
        const principalNew = otrNew - dpNew;
        const dateNew = new Date().toISOString();

        const calcNew = generateSmartSchedule(
            principalNew,
            15,
            12,
            dateNew,
            false
        );

        await Contract.create([
            {
                contract_no: 'CRD-CAR-001',
                client: clientGood,
                client_name_snapshot: 'Andri Wicaksono',
                otr_price: otrCar,
                dp_amount: dpCar,
                principal_amount: principalCar,
                interest_rate: 8,
                duration_month: 36,
                monthly_installment: calcCar.monthlyInstallment,
                total_loan: calcCar.totalLoan,
                remaining_loan: calcCar.remainingLoan, // Calculated remaining
                total_paid: calcCar.totalPaid,
                status: 'ACTIVE',
                amortization: calcCar.schedule,
                created_by: staff
            },
            {
                contract_no: 'CRD-MTR-888',
                client: clientBad,
                client_name_snapshot: 'Budi Santoso',
                otr_price: otrMotor,
                dp_amount: dpMotor,
                principal_amount: principalMotor,
                interest_rate: 15,
                duration_month: 12,
                monthly_installment: calcMotor.monthlyInstallment,
                total_loan: calcMotor.totalLoan,
                remaining_loan: calcMotor.remainingLoan,
                total_paid: calcMotor.totalPaid,
                status: 'LATE', // Forced status based on bad history
                amortization: calcMotor.schedule,
                created_by: staff
            },
            {
                contract_no: 'CRD-MTR-900',
                client: clientGood,
                client_name_snapshot: 'Andri Wicaksono',
                otr_price: otrNew,
                dp_amount: dpNew,
                principal_amount: principalNew,
                interest_rate: 15,
                duration_month: 12,
                monthly_installment: calcNew.monthlyInstallment,
                total_loan: calcNew.totalLoan,
                remaining_loan: calcNew.totalLoan, // Full loan remaining
                total_paid: 0,
                status: 'ACTIVE',
                amortization: calcNew.schedule,
                created_by: staff
            }
        ]);

        console.log('[INFO] Data Seeded Successfully.'.green.inverse);
        console.log('[INFO] Admin Credentials: sysadmin.finance / CrediaAdmin#2025!'.gray);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red.inverse);
        process.exit(1);
    }
};

importData();