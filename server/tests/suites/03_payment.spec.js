const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('Financial Engine V3.0');

    // 1. Validate Partial Payment Rejection
    await runner.test('Validation: Reject Partial Payment', async () => {
        try {
            await axios.post(`${API_URL}/contracts/${global.ACTIVE_CONTRACT_ID}/pay`, {
                month: 1,
                amount: 500 // Too small
            }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });
            throw new Error('Should reject partial payment');
        } catch (error) {
            runner.assertStatus(error.response, 400);
        }
    });

    // 2. Successful Payment
    await runner.test('Logic: Process Valid Payment', async () => {
        // Need to calculate exact amount (including potential penalty if seeder date is old)
        // Fetch contract first to check due amount
        const contractRes = await axios.get(`${API_URL}/contracts/${global.ACTIVE_CONTRACT_ID}`, {
            headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
        });
        
        const installment = contractRes.data.data.amortization.find(a => a.month === 1);
        // Assuming test runs instantly after creation, penalty is 0
        // If Logic in service forces strict date, we might need to handle penalty_estimated
        
        const payRes = await axios.post(`${API_URL}/contracts/${global.ACTIVE_CONTRACT_ID}/pay`, {
            month: 1,
            amount: installment.amount // Exact amount
        }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });

        runner.assertStatus(payRes, 200);
        runner.assertEquals(payRes.data.data.status, 'SUCCESS', 'Transaction Status');
    });

    // 3. Double Payment Prevention
    await runner.test('Validation: Reject Double Payment', async () => {
        try {
            const contractRes = await axios.get(`${API_URL}/contracts/${global.ACTIVE_CONTRACT_ID}`, {
                headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
            });
            const installment = contractRes.data.data.amortization.find(a => a.month === 1);

            await axios.post(`${API_URL}/contracts/${global.ACTIVE_CONTRACT_ID}/pay`, {
                month: 1,
                amount: installment.amount
            }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });
            
            throw new Error('Should reject double payment');
        } catch (error) {
            runner.assertStatus(error.response, 400);
        }
    });
};

module.exports = run;