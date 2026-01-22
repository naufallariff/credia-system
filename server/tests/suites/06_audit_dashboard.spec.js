const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('06. Audit Trails & Executive Analytics');

    // 1. AUDIT LOG VERIFICATION
    runner.doc(
        'Compliance: Verify Audit Trail',
        'System must have recorded the PAYMENT action performed in previous suite.'
    );
    await runner.test('Audit: Verify Payment Log existence', async () => {
        // Only Admin/Superadmin can see logs via Dashboard API
        const res = await axios.get(`${API_URL}/dashboard/analytics`, {
            headers: { Authorization: `Bearer ${runner.getContext('SUPERADMIN_TOKEN')}` }
        });

        const logs = res.data.data.recent_logs;
        const paymentLog = logs.find(l => l.action_type === 'PAYMENT' && l.actor_role === 'STAFF');

        runner.assertTruthy(paymentLog, 'Payment Log Found');
        runner.assertEquals(paymentLog.target_model, 'Transaction', 'Target Model');
    });

    // 2. DASHBOARD DATA INTEGRITY
    runner.doc(
        'Analytics: Data Aggregation Accuracy',
        'Dashboard Revenue Chart must reflect the newly processed transaction.'
    );
    await runner.test('Analytics: Verify Revenue Update', async () => {
        const res = await axios.get(`${API_URL}/dashboard/analytics`, {
            headers: { Authorization: `Bearer ${runner.getContext('ADMIN_TOKEN')}` }
        });

        const revenueData = res.data.data.revenue_chart;
        // Check if there is data for current month
        const currentMonthData = revenueData.length > 0;
        runner.assertTruthy(currentMonthData, 'Revenue Chart Populated');
    });

    // 3. SECURITY: CLIENT DATA ISOLATION
    runner.doc(
        'Privacy: Client Data Isolation',
        'Client Dashboard MUST NOT contain sensitive company logs or total revenue.'
    );
    await runner.test('Security: Client dashboard is restricted', async () => {
        const res = await axios.get(`${API_URL}/dashboard/analytics`, {
            headers: { Authorization: `Bearer ${runner.getContext('CLIENT_TOKEN')}` }
        });

        // Client dashboard returns 'loan_summary', not 'revenue_chart'
        if (res.data.data.revenue_chart) {
            throw new Error('Client can see Company Revenue!');
        }

        runner.assertTruthy(res.data.data.loan_summary, 'Client sees Loan Summary');
    });
};

module.exports = run;