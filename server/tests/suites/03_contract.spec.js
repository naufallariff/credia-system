const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('03. Contract Lifecycle & Validation');

    let clientId;

    // PRE-CONDITION: GET CLIENT
    runner.doc(
        'Pre-condition: Retrieve Valid Client',
        'System retrieves a valid Client ID (Julia Roberts) for contract creation.'
    );
    await runner.test('Setup: Fetch Client ID', async () => {
        const res = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
        });

        // Find 'Julia Roberts' from seeding data
        const client = res.data.data.find(u => u.email === 'julia.roberts@outlook.com');
        runner.assertTruthy(client, 'Client Retrieval');
        clientId = client._id;
        runner.setContext('TARGET_CLIENT_ID', clientId);
    });

    // 1. BUSINESS RULE: MINIMUM DP
    runner.doc(
        'Validation: Minimum Down Payment Rule',
        'System must REJECT contract creation if DP is below configured threshold.'
    );
    await runner.test('Validation: Reject Low DP (< 15%)', async () => {
        try {
            await axios.post(`${API_URL}/contracts`, {
                client_id: clientId,
                otr_price: 100000000, // 100 Million
                dp_amount: 10000000,  // 10 Million (10%) - Should Fail because config is 15%
                duration_month: 12
            }, {
                headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
            });
            throw new Error('System allowed low DP');
        } catch (error) {
            runner.assertStatus(error.response, 400); // Bad Request
        }
    });

    // 2. SECURITY: CLIENT CREATION ATTEMPT
    runner.doc(
        'Security: Prevent Self-Service Creation',
        'Clients MUST NOT be able to create contracts for themselves. Only Staff can.'
    );
    await runner.test('Security: Client attempts to create contract', async () => {
        try {
            await axios.post(`${API_URL}/contracts`, {
                client_id: clientId,
                otr_price: 50000000,
                dp_amount: 10000000,
                duration_month: 12
            }, {
                headers: { Authorization: `Bearer ${runner.getContext('CLIENT_TOKEN')}` }
            });
            throw new Error('Client was able to create contract');
        } catch (error) {
            runner.assertStatus(error.response, 403); // Forbidden
        }
    });

    // 3. HAPPY PATH: STAFF SUBMISSION
    runner.doc(
        'Workflow: Staff Contract Submission',
        'Staff successfully submits a valid contract. Status must be PENDING_ACTIVATION.'
    );
    await runner.test('Success: Staff creates valid contract draft', async () => {
        // OTR: 50 Million
        // Config Min DP: 15% -> 7.5 Million
        // Payload DP: 10 Million (20%) -> VALID
        const payload = {
            client_id: clientId,
            otr_price: 50000000,
            dp_amount: 10000000,
            duration_month: 12
        };

        const res = await axios.post(`${API_URL}/contracts`, payload, {
            headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
        });
        runner.assertStatus(res, 201);
        runner.assertEquals(res.data.data.status, 'PENDING_ACTIVATION', 'Initial Status');

        // Save Contract ID for next suites
        runner.setContext('PENDING_CONTRACT_ID', res.data.data._id);
    });
};

module.exports = run;