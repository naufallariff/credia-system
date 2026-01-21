require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

// Import Models (Sesuaikan path dengan struktur folder Anda)
const User = require('./models/User'); // Sesuaikan path
const Contract = require('./models/Contract');
const Transaction = require('./models/Transaction');
const GlobalConfig = require('./models/GlobalConfig');
const ModificationTicket = require('./models/ModificationTicket');
const Notification = require('./models/Notification');

// --- KONFIGURASI ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/credia_sys_db';
const SALT_ROUNDS = 10;

// --- DATA STATIS (Untuk Konsistensi Login) ---
const ROLES = {
    SUPERADMIN: { name: 'System Superadmin', email: 'super@credia.sys', role: 'SUPERADMIN' },
    ADMIN: { name: 'Sarah Finance', email: 'finance@credia.sys', role: 'ADMIN' }, // Finance / Approver
    STAFF: { name: 'Andi Sales', email: 'sales@credia.sys', role: 'STAFF' }, // Maker
};

// --- HELPER FUNCTIONS ---

// Menghitung jadwal pembayaran (Flat Rate)
const generateAmortization = (principal, interestRateYear, durationMonth, startDate) => {
    const schedule = [];
    const monthlyInterest = (principal * (interestRateYear / 100)) / 12; // Simple calculation logic
    const monthlyPrincipal = principal / durationMonth;
    // Total Installment = (Principal / Month) + ((Principal * Rate) / 12) *Note: Simplified Flat logic
    // Logic real finance biasanya: (Principal + (Principal * Rate * Years)) / Months
    const totalInterest = principal * (interestRateYear / 100) * (durationMonth / 12);
    const monthlyInstallment = Math.ceil((principal + totalInterest) / durationMonth);

    let currentDate = new Date(startDate);

    for (let i = 1; i <= durationMonth; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        schedule.push({
            month: i,
            due_date: new Date(currentDate),
            amount: monthlyInstallment,
            status: 'UNPAID',
            penalty_paid: 0,
            paid_at: null
        });
    }
    return { schedule, monthlyInstallment, totalInterest };
};

const seedDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        // 1. CLEANUP
        console.log('🧹 Cleaning Database...');
        await Promise.all([
            User.deleteMany({}),
            Contract.deleteMany({}),
            Transaction.deleteMany({}),
            GlobalConfig.deleteMany({}),
            ModificationTicket.deleteMany({}),
            Notification.deleteMany({})
        ]);

        // 2. SEED GLOBAL CONFIG
        console.log('⚙️ Seeding Config...');
        await GlobalConfig.create({
            key: 'LOAN_RULES',
            min_dp_percent: 20,
            interest_tiers: [
                { min_price: 0, max_price: 50000000, rate_percent: 15 },
                { min_price: 50000001, max_price: 500000000, rate_percent: 12 },
            ],
            company_balance: 1500000000 // Modal awal 1.5 Milyar
        });

        // 3. SEED INTERNAL USERS
        console.log('👥 Seeding Internal Users...');
        const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

        const superadmin = await User.create({
            ...ROLES.SUPERADMIN, username: 'superadmin', password: hashedPassword, status: 'ACTIVE', custom_id: 'EMP-001'
        });
        const admin = await User.create({
            ...ROLES.ADMIN, username: 'admin_finance', password: hashedPassword, status: 'ACTIVE', custom_id: 'EMP-002'
        });
        const staff = await User.create({
            ...ROLES.STAFF, username: 'staff_sales', password: hashedPassword, status: 'ACTIVE', custom_id: 'EMP-003'
        });

        // 4. SEED CLIENTS & CONTRACTS
        console.log('📝 Seeding Clients & Contracts (Complex Scenarios)...');

        const clients = [];
        // Buat 20 Client Dummy
        for (let i = 0; i < 20; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            clients.push(await User.create({
                custom_id: `CLI-2024-${1000 + i}`,
                username: faker.internet.userName({ firstName, lastName }).toLowerCase().replace(/[^a-z0-9]/g, ''),
                email: faker.internet.email({ firstName, lastName }),
                password: hashedPassword,
                name: `${firstName} ${lastName}`,
                role: 'CLIENT',
                status: 'ACTIVE',
                created_by: staff._id
            }));
        }

        // --- SCENARIO 1: ACTIVE - GOOD PAYER (Bayar Lancar) ---
        // Client Index 0-4
        for (let i = 0; i < 5; i++) {
            const otr = faker.commerce.price({ min: 20000000, max: 80000000, dec: 0 }); // Motor/Mobil Murah
            const principal = otr * 0.8; // DP 20%
            const duration = 12;
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 4); // Mulai 4 bulan lalu

            const { schedule, monthlyInstallment } = generateAmortization(principal, 12, duration, startDate);

            // Bayar 3 bulan pertama
            let totalPaid = 0;
            const transactions = [];

            for (let j = 0; j < 3; j++) {
                schedule[j].status = 'PAID';
                schedule[j].paid_at = schedule[j].due_date; // Bayar pas due date
                totalPaid += schedule[j].amount;
            }

            const contract = await Contract.create({
                submission_id: `SUB-${faker.string.alphanumeric(8).toUpperCase()}`,
                contract_no: `CTR/2024/${100 + i}`,
                client: clients[i]._id,
                client_name_snapshot: clients[i].name,
                created_by: staff._id,
                approved_by: admin._id,
                otr_price: otr,
                dp_amount: otr * 0.2,
                principal_amount: principal,
                interest_rate: 12,
                duration_month: duration,
                monthly_installment: monthlyInstallment,
                total_loan: monthlyInstallment * duration,
                remaining_loan: (monthlyInstallment * duration) - totalPaid,
                total_paid: totalPaid,
                status: 'ACTIVE',
                amortization: schedule
            });

            // Buat Transaksi untuk pembayaran yg sudah dilakukan
            for (let j = 0; j < 3; j++) {
                await Transaction.create({
                    contract: contract._id,
                    transaction_no: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
                    amount_paid: schedule[j].amount,
                    period_month: schedule[j].month,
                    payment_method: 'TRANSFER',
                    status: 'SUCCESS',
                    processed_by: admin._id,
                    processed_at: schedule[j].paid_at
                });
            }
        }

        // --- SCENARIO 2: ACTIVE - LATE PAYER (Telat Bayar) ---
        // Client Index 5-7
        for (let i = 5; i < 8; i++) {
            const otr = 120000000; // Mobil LCGC
            const { schedule, monthlyInstallment } = generateAmortization(otr * 0.8, 12, 24, new Date('2023-01-01'));

            // Bulan 1-5 bayar, Bulan 6 Telat & Belum bayar
            let totalPaid = 0;
            for (let j = 0; j < 5; j++) {
                schedule[j].status = 'PAID';
                schedule[j].paid_at = schedule[j].due_date;
                totalPaid += schedule[j].amount;
            }
            // Bulan ke 6 LATE
            schedule[5].status = 'LATE'; // Simulasi cron job sudah jalan

            await Contract.create({
                submission_id: `SUB-${faker.string.alphanumeric(8).toUpperCase()}`,
                contract_no: `CTR/2023/${200 + i}`,
                client: clients[i]._id,
                client_name_snapshot: clients[i].name,
                created_by: staff._id,
                approved_by: admin._id,
                otr_price: otr,
                dp_amount: otr * 0.2,
                principal_amount: otr * 0.8,
                interest_rate: 12,
                duration_month: 24,
                monthly_installment: monthlyInstallment,
                total_loan: monthlyInstallment * 24,
                remaining_loan: (monthlyInstallment * 24) - totalPaid,
                total_paid: totalPaid,
                status: 'ACTIVE', // Masih aktif walau telat
                amortization: schedule
            });

            // Create Notif Warning
            await Notification.create({
                recipient_id: clients[i]._id,
                type: 'WARNING',
                title: 'Payment Overdue',
                message: `Installment for month 6 is overdue. Please pay immediately to avoid penalties.`
            });
        }

        // --- SCENARIO 3: PENDING ACTIVATION (Baru Submit) ---
        // Client Index 8-12
        for (let i = 8; i < 13; i++) {
            const otr = 35000000;
            const duration = 12;
            const { schedule, monthlyInstallment } = generateAmortization(otr * 0.8, 15, duration, new Date()); // Bunga 15%

            await Contract.create({
                submission_id: `SUB-${faker.string.alphanumeric(8).toUpperCase()}`,
                // Contract No BELUM ADA karena belum approve
                client: clients[i]._id,
                client_name_snapshot: clients[i].name,
                created_by: staff._id,
                // Approved by BELUM ADA
                otr_price: otr,
                dp_amount: otr * 0.2,
                principal_amount: otr * 0.8,
                interest_rate: 15,
                duration_month: duration,
                monthly_installment: monthlyInstallment,
                total_loan: monthlyInstallment * duration,
                remaining_loan: monthlyInstallment * duration,
                total_paid: 0,
                status: 'PENDING_ACTIVATION',
                amortization: schedule // Draft schedule
            });
        }

        // --- SCENARIO 4: REJECTED / VOID (Ditolak) ---
        // Client Index 13-14
        for (let i = 13; i < 15; i++) {
            const otr = 500000000; // Mobil Mewah (High Risk)
            const { schedule, monthlyInstallment } = generateAmortization(otr * 0.7, 10, 36, new Date());

            await Contract.create({
                submission_id: `SUB-${faker.string.alphanumeric(8).toUpperCase()}`,
                client: clients[i]._id,
                client_name_snapshot: clients[i].name,
                created_by: staff._id,
                otr_price: otr,
                dp_amount: otr * 0.3,
                principal_amount: otr * 0.7,
                interest_rate: 10,
                duration_month: 36,
                monthly_installment: monthlyInstallment,
                total_loan: monthlyInstallment * 36,
                remaining_loan: monthlyInstallment * 36,
                total_paid: 0,
                status: 'REJECTED',
                void_reason: 'High risk profile, incomplete documents (Slip Gaji missing)',
                amortization: schedule
            });
        }

        // 5. SEED MODIFICATION TICKETS (Data Correction)
        console.log('🎫 Seeding Tickets...');
        const targetContract = await Contract.findOne({ status: 'ACTIVE' });
        if (targetContract) {
            await ModificationTicket.create({
                ticket_no: `TICKET-${faker.string.numeric(6)}`,
                requester_id: staff._id,
                target_model: 'CONTRACT',
                target_id: targetContract._id,
                request_type: 'UPDATE',
                reason: 'Typo in client address',
                status: 'PENDING',
                original_data: { address: 'Old Address' },
                proposed_data: { address: 'New Correct Address' }
            });
        }

        console.log('✅ Database Seeded Successfully!');
        console.log(`   - Superadmin: ${ROLES.SUPERADMIN.email} / password123`);
        console.log(`   - Admin: ${ROLES.ADMIN.email} / password123`);
        console.log(`   - Staff: ${ROLES.STAFF.email} / password123`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedDatabase();