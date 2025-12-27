const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('Contract Lifecycle & Business Rules');

    let clientId;

    // Helper: Get a Client ID first
    await runner.test('Setup: Retrieve Client ID', async () => {
        const res = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${global.ADMIN_TOKEN}` }
        });
        const client = res.data.data.find(u => u.role === 'CLIENT');
        runner.assertTruthy(client, 'Client existence');
        clientId = client._id;
    });

    // 1. Validation: DP too low
    await runner.test('Validation: Reject DP below 20%', async () => {
        try {
            await axios.post(`${API_URL}/contracts`, {
                contractNo: `FAIL-${Date.now()}`,
                clientId: clientId,
                otr: 20000000,
                dpAmount: 1000000, // Only 5% (Too low)
                durationMonths: 12,
                startDate: '2025-01-01'
            }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });
            throw new Error('Should have rejected low DP');
        } catch (error) {
            runner.assertStatus(error.response, 400); // Pastikan status code sesuai controller Anda (bisa 400 atau 500)
        }
    });

    // 2. Successful Creation
    const validContractNo = `TEST-${Math.floor(Math.random() * 100000)}`;
    await runner.test('Logic: Create Valid Contract and Verify Financials', async () => {
        const payload = {
            contractNo: validContractNo,
            clientId: clientId,
            otr: 30000000, // 30 Juta (Masuk Kategori Motor < 50jt)
            dpAmount: 6000000, // 20%
            durationMonths: 12,
            startDate: new Date().toISOString().split('T')[0]
        };

        const res = await axios.post(`${API_URL}/contracts`, payload, {
            headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
        });

        runner.assertStatus(res, 201);
        
        // Manual Math Verification (UPDATED 15% RATE)
        const principal = 30000000 - 6000000; // 24jt
        
        // [FIX] Gunakan 0.15 (15%) karena OTR < 50 Juta
        const expectedInterest = Math.ceil(principal * 0.15 * 1); // 15% flat = 3.6jt
        
        const expectedTotal = principal + expectedInterest; // 24 + 3.6 = 27.6jt
        const expectedMonthly = Math.ceil((expectedTotal / 12) / 1000) * 1000; // 2.300.000

        runner.assertEquals(res.data.data.principal_amount, principal, 'Principal Amount');
        runner.assertEquals(res.data.data.monthly_installment, expectedMonthly, 'Monthly Installment Calculation');
        
        // [PENTING] Save global variable agar test selanjutnya bisa jalan
        global.NEW_CONTRACT_NO = validContractNo; 
    });
};

module.exports = run;