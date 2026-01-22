const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('05. Financial Engine & Ledger Integrity');

    const contractId = runner.getContext('ACTIVE_CONTRACT_ID');
    let installmentAmount = 0;

    // PRE-CONDITION: GET BILL
    runner.doc(
        'Pre-condition: Retrieve Billing Details',
        'System calculates the exact amount due for Month 1.'
    );
    await runner.test('Setup: Get Installment Amount', async () => {
        const res = await axios.get(`${API_URL}/contracts/${contractId}`, {
            headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
        });

        const schedule = res.data.data.amortization.find(a => a.month === 1);
        installmentAmount = schedule.amount;
        runner.assertTruthy(installmentAmount > 0, 'Installment Amount > 0');
    });

    // 1. BUSINESS RULE: EXACT AMOUNT
    runner.doc(
        'Validation: Reject Partial Payments',
        'System must REJECT payments that do not cover the full installment amount.'
    );
    await runner.test('Validation: Reject Underpayment', async () => {
        try {
            await axios.post(`${API_URL}/contracts/${contractId}/payments`, {
                month: 1,
                amount: installmentAmount - 5000 // Short 5000
            }, {
                headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
            });
            throw new Error('System accepted partial payment');
        } catch (error) {
            runner.assertStatus(error.response, 400);
        }
    });

    // 2. HAPPY PATH: PAYMENT PROCESSING
    runner.doc(
        'Transaction: Process Valid Payment',
        'System records payment, updates ledger, and issues receipt.'
    );
    await runner.test('Success: Staff processes valid payment', async () => {
        const res = await axios.post(`${API_URL}/contracts/${contractId}/payments`, {
            month: 1,
            amount: installmentAmount
        }, {
            headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
        });

        runner.assertStatus(res, 200);
        runner.assertEquals(res.data.data.status, 'SUCCESS', 'Transaction Status');
        runner.assertTruthy(res.data.data.transaction_no, 'Transaction ID generated');
    });

    // 3. BUSINESS RULE: IDEMPOTENCY
    runner.doc(
        'Integrity: Prevent Double Billing',
        'System must REJECT payment for an installment that is already PAID.'
    );
    await runner.test('Validation: Reject Double Payment', async () => {
        try {
            await axios.post(`${API_URL}/contracts/${contractId}/payments`, {
                month: 1,
                amount: installmentAmount
            }, {
                headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
            });
            throw new Error('System allowed double payment');
        } catch (error) {
            runner.assertStatus(error.response, 400); // Bad Request
        }
    });
};

module.exports = run;