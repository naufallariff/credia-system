const axios = require('axios');

// Konfigurasi
const API_URL = 'http://localhost:5000/api';
let STAFF_TOKEN = '';
let NEW_CONTRACT_NO = `TEST-${Math.floor(Math.random() * 10000)}`; // Random biar gak duplikat kalau run ulang

const runTest = async () => {
    try {
        // --- STEP 1: AUTHENTICATION ---
        console.log('\n--- STEP 1: AUTHENTICATION ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'staff_budi', // Login sebagai Staff
            password: 'staffPassword123'
        });
        STAFF_TOKEN = loginRes.data.data.token;
        console.log('[PASS] Login success. Token retrieved.');

        // --- STEP 2: TRANSACTION TEST (CREATE CONTRACT) ---
        console.log('\n--- STEP 2: CREATE CONTRACT (Dynamic Rules) ---');

        const todayDate = new Date().toISOString().split('T')[0];
        // Kita coba input motor 30 Juta, DP 6 Juta (20%), Tenor 12 Bulan
        const createPayload = {
            contractNo: NEW_CONTRACT_NO,
            clientId: '658c7f...', // Nanti kita skip client ID, backend akan create dummy atau kita ambil dari seeder kalo niat. 
            // TAPI: CreateContract butuh Valid Client ID. 
            // SOLUSI: Kita perlu ambil Client ID dulu dari database atau hardcode ID dari seeder.
            // Biar gampang, kita hardcode ID Client Sugus (Kita asumsikan run seeder dulu).
            // Kalo ID berubah-ubah, script ini harus fetch user dulu.
            // Untuk simple test, kita fetch user dulu deh biar robust.
        };

        // *Fetch Users dulu (Admin only route sebenernya, tapi kita hack dikit login admin dulu)*
        // Skip aja, kita pakai Client Sugus yang baru kita buat di Seeder.
        // TAPI: ID di MongoDB itu random setiap kali seeder jalan.
        // JADI: Kita harus login Admin -> Get Users -> Ambil ID Client -> Login Staff -> Create.

        // Login Admin Sebentar
        const adminLogin = await axios.post(`${API_URL}/auth/login`, { username: 'admin_sys', password: 'secureAdminPassword!23' });
        const adminToken = adminLogin.data.data.token;
        const usersRes = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${adminToken}` } });
        const clientSugus = usersRes.data.data.find(u => u.username === 'client_sugus');

        if (!clientSugus) throw new Error("Jalankan 'node server/src/seeder.js' dulu!");

        console.log(`[INFO] Using Client ID: ${clientSugus._id}`);

        // Lanjut Create Contract pakai Token Staff
        const contractRes = await axios.post(`${API_URL}/contracts`, {
            contractNo: NEW_CONTRACT_NO,
            clientId: clientSugus._id, // Pastikan ID ini valid dari log seeder/console
            otr: 30000000,
            dpAmount: 6000000,
            durationMonths: 12,
            startDate: todayDate // <--- JANGAN HARDCODE TAHUN LALU
        }, {
            headers: { Authorization: `Bearer ${STAFF_TOKEN}` }
        });

        const contractData = contractRes.data.data;
        console.log('[PASS] Contract created successfully.');
        console.log(`       ID: ${contractData.contract_no}`);
        console.log(`       Installment: Rp ${contractData.monthly_installment.toLocaleString('id-ID')}`);
        console.log(`       Total Loan: Rp ${contractData.total_loan.toLocaleString('id-ID')}`);


        // --- STEP 3: READ DETAIL (EMBEDDED CHECK) ---
        console.log('\n--- STEP 3: READ DETAIL & PENALTY CHECK ---');
        const detailRes = await axios.get(`${API_URL}/contracts/${NEW_CONTRACT_NO}`, {
            headers: { Authorization: `Bearer ${STAFF_TOKEN}` }
        });

        const detail = detailRes.data.data;
        const firstInstallment = detail.amortization[0];

        console.log('[PASS] Data Retrieved.');
        console.log(`       Remaining Loan: Rp ${detail.summary.remaining_loan.toLocaleString('id-ID')}`);
        console.log(`       Next Due Date: ${new Date(firstInstallment.due_date).toLocaleDateString()}`);


        // --- STEP 4: PAYMENT TEST (THE NEW FEATURE) ---
        console.log('\n--- STEP 4: PAY INSTALLMENT (Bulan 1) ---');

        // Kita bayar bulan ke-1
        const monthToPay = 1;
        const amountToPay = firstInstallment.amount; // Bayar pas

        const payRes = await axios.post(
            `${API_URL}/contracts/${NEW_CONTRACT_NO}/installments/${monthToPay}/pay`,
            {
                amountPaid: amountToPay,
                method: 'TRANSFER'
            },
            { headers: { Authorization: `Bearer ${STAFF_TOKEN}` } }
        );

        console.log('[PASS] Payment Processed!');
        console.log(`       Receipt No: ${payRes.data.data.receipt_no}`);
        console.log(`       Status: ${payRes.data.data.status}`);
        console.log(`       New Remaining Loan: ${payRes.data.data.remaining_loan}`);

    } catch (error) {
        console.error('\n[FAIL] Test Failed');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Message:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
};

runTest();