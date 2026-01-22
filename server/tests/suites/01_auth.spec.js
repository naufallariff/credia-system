const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('01. Authentication & Identity Management');

    // 1. SUPERADMIN LOGIN
    runner.doc(
        'Verify Superadmin access privileges.',
        'System should return a valid JWT token for configured Superadmin.'
    );
    await runner.test('Login: Superadmin (Alexander Pierce)', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'alexander.pierce@credia.finance', // Can accept email too
            password: 'password123'
        });
        runner.assertStatus(res, 200);
        runner.setContext('SUPERADMIN_TOKEN', res.data.data.token);
    });

    // 2. STAFF LOGIN
    runner.doc(
        'Verify Operational Staff access.',
        'System should authenticate Staff and return role-specific token.'
    );
    await runner.test('Login: Staff (Emily Blunt)', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'emily.blunt@credia.finance',
            password: 'password123'
        });
        runner.assertStatus(res, 200);
        runner.setContext('STAFF_TOKEN', res.data.data.token);
    });

    // 3. ADMIN LOGIN
    runner.doc(
        'Verify Admin (Approver) access.',
        'System should authenticate Admin successfully.'
    );
    await runner.test('Login: Admin (Sarah Jenkins)', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'sarah.jenkins@credia.finance',
            password: 'password123'
        });
        runner.assertStatus(res, 200);
        runner.setContext('ADMIN_TOKEN', res.data.data.token);
    });

    // 4. CLIENT LOGIN
    runner.doc(
        'Verify Client access.',
        'System should authenticate active Client.'
    );
    await runner.test('Login: Client (Julia Roberts - Active)', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'julia.roberts@outlook.com',
            password: 'password123'
        });
        runner.assertStatus(res, 200);
        runner.setContext('CLIENT_TOKEN', res.data.data.token);
        runner.setContext('CLIENT_ID', res.data.data.user.id);
    });

    // 5. SECURITY: SUSPENDED ACCOUNT
    runner.doc(
        'Security Check: Suspended Account Access',
        'System must REJECT login attempt from suspended users (Robert Vance).'
    );
    await runner.test('Security: Deny Suspended Admin', async () => {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                username: 'robert.vance@credia.finance',
                password: 'password123'
            });
            throw new Error('Suspended user was allowed to login');
        } catch (error) {
            runner.assertStatus(error.response, 403); // Forbidden
            runner.assertEquals(error.response.data.message, 'Account access has been suspended.', 'Error Message');
        }
    });

    // 6. SECURITY: UNVERIFIED ACCOUNT
    runner.doc(
        'Security Check: Unverified Account Access',
        'System must REJECT login for unverified leads.'
    );
    await runner.test('Security: Deny Unverified User', async () => {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                username: 'new.user.test@gmail.com',
                password: 'password123'
            });
            throw new Error('Unverified user was allowed to login');
        } catch (error) {
            runner.assertStatus(error.response, 403);
        }
    });
};

module.exports = run;