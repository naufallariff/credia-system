const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('04. Governance Workflow (Maker-Checker)');

    const contractId = runner.getContext('PENDING_CONTRACT_ID');

    // 1. SECURITY: STAFF APPROVAL ATTEMPT
    runner.doc(
        'SoD Check: Prevent Maker-Approval',
        'The Staff who created the contract (Maker) CANNOT Approve it.'
    );
    await runner.test('Security: Staff attempts to Approve', async () => {
        try {
            await axios.patch(`${API_URL}/contracts/${contractId}/status`, {
                action: 'APPROVE'
            }, {
                headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
            });
            throw new Error('Staff was able to approve contract');
        } catch (error) {
            runner.assertStatus(error.response, 403);
        }
    });

    // 2. HAPPY PATH: ADMIN APPROVAL
    runner.doc(
        'Workflow: Admin Approval (Activation)',
        'Admin reviews and activates the contract. System must generate Contract Number.'
    );
    await runner.test('Success: Admin activates contract', async () => {
        const res = await axios.patch(`${API_URL}/contracts/${contractId}/status`, {
            action: 'APPROVE',
            reason: 'Credit Check Passed'
        }, {
            headers: { Authorization: `Bearer ${runner.getContext('ADMIN_TOKEN')}` }
        });

        runner.assertStatus(res, 200);
        runner.assertEquals(res.data.data.status, 'ACTIVE', 'Contract Status');
        runner.assertTruthy(res.data.data.contract_no, 'Official Contract No Generated');

        runner.setContext('ACTIVE_CONTRACT_ID', contractId);
    });
};

module.exports = run;