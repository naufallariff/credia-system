const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('Payment Engine & Penalty Logic');

    // 1. Get Contract Details
    let monthlyBill = 0;
    await runner.test('Retrieve Contract Details', async () => {
        const res = await axios.get(`${API_URL}/contracts/${global.NEW_CONTRACT_NO}`, {
            headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
        });
        runner.assertStatus(res, 200);
        monthlyBill = res.data.data.monthly_installment;
        runner.assertTruthy(monthlyBill > 0, 'Monthly bill should be positive');
    });

    // 2. Partial Payment (Should Fail)
    await runner.test('Validation: Reject Partial Payment', async () => {
        try {
            await axios.post(
                `${API_URL}/contracts/${global.NEW_CONTRACT_NO}/installments/1/pay`,
                { amountPaid: monthlyBill - 50000 }, // Less than required
                { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } }
            );
            throw new Error('Should reject partial payment');
        } catch (error) {
            // Expect error message about insufficient payment
            runner.assertStatus(error.response, 500); 
        }
    });

    // 3. Success Payment (On Time)
    await runner.test('Logic: Process Valid Payment (On Time)', async () => {
        const res = await axios.post(
            `${API_URL}/contracts/${global.NEW_CONTRACT_NO}/installments/1/pay`,
            { amountPaid: monthlyBill },
            { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } }
        );
        
        runner.assertStatus(res, 200);
        runner.assertEquals(res.data.data.status, 'SUCCESS', 'Transaction Status');
        runner.assertEquals(res.data.data.penalty_paid, 'Rp 0', 'Penalty should be 0');
    });

    // 4. Double Payment (Should Fail)
    await runner.test('Validation: Reject Double Payment', async () => {
        try {
            await axios.post(
                `${API_URL}/contracts/${global.NEW_CONTRACT_NO}/installments/1/pay`,
                { amountPaid: monthlyBill },
                { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } }
            );
            throw new Error('Should reject double payment');
        } catch (error) {
            runner.assertStatus(error.response, 500);
        }
    });

    // 5. SIMULATION: Late Payment
    await runner.test('Logic: Penalty Calculation for Late Contract', async () => {
        // Create a new contract backdated 1 year ago
        const adminRes = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${global.ADMIN_TOKEN}` } });
        const client = adminRes.data.data.find(u => u.role === 'CLIENT');
        const lateContractNo = `LATE-${Date.now()}`;

        // Create contract starting in 2023
        const createRes = await axios.post(`${API_URL}/contracts`, {
            contractNo: lateContractNo,
            clientId: client._id,
            otr: 15000000,
            dpAmount: 3000000,
            durationMonths: 12,
            startDate: '2023-01-01' // Very old date
        }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });

        const installmentAmount = createRes.data.data.monthly_installment;

        // Try to pay Month 1 (which was due Feb 2023)
        // Backend should reject if we only pay installmentAmount because penalty is huge
        try {
            await axios.post(
                `${API_URL}/contracts/${lateContractNo}/installments/1/pay`,
                { amountPaid: installmentAmount },
                { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } }
            );
            throw new Error('Should reject payment without penalty');
        } catch (error) {
            // We expect it to fail, but let's verify the message contains "Denda" or "Penalty"
            const msg = error.response.data.message;
            if (!msg.includes('Denda') && !msg.includes('Penalty')) {
                throw new Error('Error message did not mention penalty details');
            }
        }
    });
};

module.exports = run;