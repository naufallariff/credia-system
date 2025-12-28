const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('Workflow: Approval & Maker-Checker');

    // 1. Staff Submits a Draft Contract
    let submissionId;
    await runner.test('Staff: Submit Contract Draft', async () => {
        const payload = {
            clientId: global.CLIENT_ID, // From previous tests
            otr: 50000000,
            dpAmount: 10000000,
            durationMonths: 12,
            startDate: new Date().toISOString()
        };
        
        const res = await axios.post(`${API_URL}/contracts`, payload, {
            headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
        });
        
        runner.assertStatus(res, 201);
        runner.assertEquals(res.data.data.status, 'PENDING_ACTIVATION', 'Status should be Pending');
        submissionId = res.data.data.submission_id;
        global.PENDING_CONTRACT_ID = res.data.data._id;
    });

    // 2. Staff Tries to Pay (Should Fail - Not Active)
    await runner.test('Validation: Cannot pay Pending Contract', async () => {
        try {
            await axios.post(`${API_URL}/contracts/${global.PENDING_CONTRACT_ID}/pay`, 
                { month: 1, amount: 1000000 },
                { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } }
            );
            throw new Error('Should not allow payment');
        } catch (error) {
            runner.assertStatus(error.response, 400); // Bad Request
        }
    });

    // 3. Admin Approves (Activates)
    await runner.test('Admin: Approve Activation Ticket', async () => {
        // In the real flow, creating a contract creates a Ticket automatically behind the scenes
        // Or Admin uses a specific endpoint to activate. 
        // For V3 architecture, let's assume Staff must create a ticket to Activate.
        
        // Simulating the Ticket Creation for Activation (Simplified for test)
        const ticketRes = await axios.post(`${API_URL}/tickets`, {
            targetModel: 'CONTRACT',
            targetId: global.PENDING_CONTRACT_ID,
            requestType: 'ACTIVATE',
            reason: 'Documents valid',
            proposedData: {}
        }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });

        const ticketId = ticketRes.data.data._id;

        // Admin Action
        const res = await axios.put(`${API_URL}/tickets/${ticketId}/approve`, {
            action: 'APPROVE',
            note: 'Looks good'
        }, { headers: { Authorization: `Bearer ${global.ADMIN_TOKEN}` } });

        runner.assertStatus(res, 200);
        runner.assertEquals(res.data.data.status, 'APPROVED', 'Ticket Status');
    });

    // 4. Verify Active Status
    await runner.test('System: Verify Contract Activation', async () => {
        const res = await axios.get(`${API_URL}/contracts/${global.PENDING_CONTRACT_ID}`, {
            headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
        });
        
        runner.assertEquals(res.data.data.status, 'ACTIVE', 'Contract Status');
        runner.assertTruthy(res.data.data.contract_no, 'Official Contract No Generated');
    });
};

module.exports = run;