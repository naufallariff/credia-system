const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const Contract = require('./models/Contract');
const ModificationTicket = require('./models/ModificationTicket');
const Notification = require('./models/Notification');
const GlobalConfig = require('./models/GlobalConfig');
const { generateId } = require('./utils/idGenerator');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const setUTCMidnight = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// Amortization Generator (Simplified for Seeder)
const generateSchedule = (principal, rate, months, startDateString) => {
    const schedule = [];
    const totalInterest = Math.ceil(principal * (rate / 100) * (months / 12));
    const totalLoan = principal + totalInterest;
    const monthlyInstallment = Math.ceil((totalLoan / months) / 1000) * 1000;
    
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
    return { schedule, monthlyInstallment, totalLoan };
};

const importData = async () => {
    try {
        console.log('[INFO] Purging Database...'.red);
        await User.deleteMany();
        await Contract.deleteMany();
        await ModificationTicket.deleteMany();
        await Notification.deleteMany();
        await GlobalConfig.deleteMany();

        console.log('[INFO] Injecting Global Config...'.blue);
        await GlobalConfig.create({
            key: 'LOAN_RULES',
            min_dp_percent: 0.20,
            interest_tiers: [
                { min_price: 0, max_price: 50000000, rate_percent: 15 },
                { min_price: 50000001, max_price: 1000000000, rate_percent: 8 }
            ]
        });

        console.log('[INFO] Creating IAM Users...'.green);
        
        // 1. Internal Team
        const superAdmin = await User.create({
            custom_id: generateId('USER'),
            username: 'super.root',
            email: 'root@credia.system',
            password: 'SuperSecretPassword!1',
            name: 'System Superadmin',
            role: 'SUPERADMIN',
            status: 'ACTIVE'
        });

        const adminFinance = await User.create({
            custom_id: generateId('USER'),
            username: 'admin.finance',
            email: 'finance@credia.system',
            password: 'AdminPassword!23',
            name: 'Sarah Finance',
            role: 'ADMIN',
            status: 'ACTIVE',
            created_by: superAdmin._id
        });

        const staffSales = await User.create({
            custom_id: generateId('USER'),
            username: 'staff.sales',
            email: 'sales@credia.system',
            password: 'StaffPassword!23',
            name: 'Budi Sales',
            role: 'STAFF',
            status: 'ACTIVE',
            created_by: adminFinance._id
        });

        // 2. Clients (Borrowers)
        const client1 = await User.create({
            custom_id: generateId('USER'),
            username: 'client.andri',
            email: 'andri@gmail.com',
            password: 'UserPassword!23',
            name: 'Andri Wicaksono',
            role: 'CLIENT',
            status: 'ACTIVE',
            created_by: adminFinance._id
        });

        const client2 = await User.create({
            custom_id: generateId('USER'),
            username: 'client.dewi',
            email: 'dewi@gmail.com',
            password: 'UserPassword!23',
            name: 'Dewi Persik',
            role: 'CLIENT',
            status: 'ACTIVE',
            created_by: adminFinance._id
        });

        console.log('[INFO] Generating Contracts...'.green);

        // Scenario 1: ACTIVE Contract (Running smoothly)
        const calc1 = generateSchedule(20000000, 15, 12, '2024-01-01');
        const contractActive = await Contract.create({
            submission_id: generateId('SUBMISSION'),
            contract_no: generateId('CONTRACT'),
            client: client1._id,
            client_name_snapshot: client1.name,
            created_by: staffSales._id,
            approved_by: adminFinance._id,
            otr_price: 25000000,
            dp_amount: 5000000,
            principal_amount: 20000000,
            interest_rate: 15,
            duration_month: 12,
            monthly_installment: calc1.monthlyInstallment,
            total_loan: calc1.totalLoan,
            remaining_loan: calc1.totalLoan,
            status: 'ACTIVE',
            amortization: calc1.schedule
        });

        // Scenario 2: PENDING Contract (Waiting for Approval)
        // Staff submitted, but Admin hasn't touched it. Contract No is null/undefined.
        const calc2 = generateSchedule(80000000, 8, 24, new Date().toISOString());
        const contractPending = await Contract.create({
            submission_id: generateId('SUBMISSION'),
            // No contract_no yet!
            client: client2._id,
            client_name_snapshot: client2.name,
            created_by: staffSales._id,
            otr_price: 100000000,
            dp_amount: 20000000,
            principal_amount: 80000000,
            interest_rate: 8,
            duration_month: 24,
            monthly_installment: calc2.monthlyInstallment,
            total_loan: calc2.totalLoan,
            remaining_loan: calc2.totalLoan,
            status: 'PENDING_ACTIVATION',
            amortization: calc2.schedule
        });

        console.log('[INFO] Generating Approval Tickets...'.green);

        // Scenario 3: Request Correction (Staff made a typo on Active Contract)
        await ModificationTicket.create({
            ticket_no: generateId('TICKET'),
            requester_id: staffSales._id,
            target_model: 'CONTRACT',
            target_id: contractActive._id,
            request_type: 'UPDATE',
            original_data: { client_name: 'Andri Wicaksono' },
            proposed_data: { client_name: 'Andri Wicaksono Gelar S.Kom' },
            reason: 'Correction on client full name title',
            status: 'PENDING'
        });

        // Notification for Admin
        await Notification.create({
            recipient_id: adminFinance._id,
            type: 'WARNING',
            title: 'New Contract Needs Approval',
            message: `Submission ${contractPending.submission_id} is waiting for review.`,
            related_id: contractPending.submission_id
        });

        console.log('[INFO] Database Seeded Successfully with V3.0 Architecture.'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red.inverse);
        process.exit(1);
    }
};

importData();