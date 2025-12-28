const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('Contract Lifecycle V3.0');

    let clientId;

    // Helper: Get Client ID
    await runner.test('Setup: Fetch Client ID', async () => {
        const res = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${global.ADMIN_TOKEN}` }
        });
        const client = res.data.data.find(u => u.username === 'client.andri');
        runner.assertTruthy(client, 'Client Retrieval');
        clientId = client._id;
    });

    // 1. Validation Test
    await runner.test('Validation: Reject Low DP', async () => {
        try {
            await axios.post(`${API_URL}/contracts`, {
                clientId: clientId,
                otr: 30000000,
                dpAmount: 1000000, // Too low
                durationMonths: 12,
                startDate: '2025-01-01'
            }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });
            throw new Error('Should reject low DP');
        } catch (error) {
            runner.assertStatus(error.response, 400);
        }
    });

    // 2. Create Submission (Pending)
    await runner.test('Logic: Submit Contract Draft', async () => {
        const payload = {
            clientId: clientId,
            otr: 30000000,
            dpAmount: 6000000, // 20%
            durationMonths: 12,
            startDate: new Date().toISOString()
        };

        const res = await axios.post(`${API_URL}/contracts`, payload, {
            headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
        });

        runner.assertStatus(res, 201);
        runner.assertEquals(res.data.data.status, 'PENDING_ACTIVATION', 'Initial Status');
        
        global.PENDING_CONTRACT_ID = res.data.data._id;
    });

    // 3. Activation via Ticket (Simulated for V3)
    // Assuming backend auto-generates ticket or we create one manually.
    // Here we manually create an ACTIVATE ticket to simulate Staff request
    await runner.test('Workflow: Create Activation Ticket', async () => {
        const res = await axios.post(`${API_URL}/tickets`, {
            targetModel: 'CONTRACT',
            targetId: global.PENDING_CONTRACT_ID,
            requestType: 'ACTIVATE',
            reason: 'Documents verified',
            proposedData: {}
        }, { headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` } });
        
        runner.assertStatus(res, 201);
        global.TICKET_ID = res.data.data._id;
    });

    // 4. Admin Approves
    await runner.test('Workflow: Admin Approves Activation', async () => {
        const res = await axios.put(`${API_URL}/tickets/${global.TICKET_ID}/approve`, {
            action: 'APPROVE',
            note: 'Approved by Finance Head'
        }, { headers: { Authorization: `Bearer ${global.ADMIN_TOKEN}` } });

        runner.assertStatus(res, 200);
        runner.assertEquals(res.data.data.status, 'APPROVED', 'Ticket Status');
    });

    // 5. Verify Active
    await runner.test('Verification: Contract is now ACTIVE', async () => {
        const res = await axios.get(`${API_URL}/contracts/${global.PENDING_CONTRACT_ID}`, {
            headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
        });
        
        runner.assertEquals(res.data.data.status, 'ACTIVE', 'Contract Status');
        runner.assertTruthy(res.data.data.contract_no, 'Official Contract No exists');
        global.ACTIVE_CONTRACT_ID = global.PENDING_CONTRACT_ID;
    });
};

module.exports = run;