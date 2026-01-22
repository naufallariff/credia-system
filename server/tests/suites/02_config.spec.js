const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('02. System Configuration & RBAC Governance');

    // 1. READ CONFIG
    runner.doc(
        'Verify Configuration Visibility',
        'All authenticated users (including Staff) should be able to READ config.'
    );
    await runner.test('Read: Staff retrieves Global Config', async () => {
        const res = await axios.get(`${API_URL}/config`, {
            headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
        });
        runner.assertStatus(res, 200);
        runner.assertTruthy(res.data.data.min_dp_percent, 'Min DP Config exists');
    });

    // 2. UNAUTHORIZED WRITE
    runner.doc(
        'RBAC: Prevent Unauthorized Changes',
        'Staff MUST NOT be able to update global configuration.'
    );
    await runner.test('Security: Staff tries to update Interest Rate', async () => {
        try {
            await axios.put(`${API_URL}/config`, {
                min_dp_percent: 10,
                interest_tiers: []
            }, {
                headers: { Authorization: `Bearer ${runner.getContext('STAFF_TOKEN')}` }
            });
            throw new Error('Staff was able to update config');
        } catch (error) {
            runner.assertStatus(error.response, 403);
        }
    });

    // 3. AUTHORIZED WRITE (SUPERADMIN)
    runner.doc(
        'Governance: Superadmin Updates',
        'Superadmin should be able to update system parameters. Audit log should be generated.'
    );
    await runner.test('Write: Superadmin updates Interest Rate', async () => {
        // Standard Protocol: Use integer 15 for 15%.
        const payload = {
            min_dp_percent: 15, 
            interest_tiers: [
                { min_price: 0, max_price: 1000000000, rate_percent: 12 }
            ]
        };

        const res = await axios.put(`${API_URL}/config`, payload, {
            headers: { Authorization: `Bearer ${runner.getContext('SUPERADMIN_TOKEN')}` }
        });

        runner.assertStatus(res, 200);
        runner.assertEquals(res.data.data.min_dp_percent, 15, 'Config Updated');
    });
};

module.exports = run;