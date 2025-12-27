const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('Authentication & Security RBAC');

    // 1. Valid Admin Login (Gunakan Kredensial Credia)
    await runner.test('Login with valid Admin credentials', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'sysadmin.finance', // UPDATED
            password: 'CrediaAdmin#2025!' // UPDATED
        });
        runner.assertStatus(res, 200);
        runner.assertTruthy(res.data.data.token, 'Token existence');
        global.ADMIN_TOKEN = res.data.data.token; // Save for later
    });

    // 2. Valid Staff Login (Gunakan Kredensial Credia)
    await runner.test('Login with valid Staff credentials', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'staff.jakarta',   // UPDATED
            password: 'StaffAccess@123'  // UPDATED
        });
        runner.assertStatus(res, 200);
        global.STAFF_TOKEN = res.data.data.token; // Save for later
    });

    // 3. Invalid Password
    await runner.test('Login with incorrect password should fail', async () => {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                username: 'sysadmin.finance',
                password: 'wrongpassword'
            });
            throw new Error('Request should have failed but succeeded');
        } catch (error) {
            runner.assertStatus(error.response, 401);
        }
    });

    // 4. Access Protected Route without Token
    await runner.test('Accessing /api/auth/me without token should return 401', async () => {
        try {
            await axios.get(`${API_URL}/auth/me`);
            throw new Error('Request should have failed');
        } catch (error) {
            runner.assertStatus(error.response, 401);
        }
    });

    // 5. RBAC: Client cannot access Admin routes
    await runner.test('RBAC: Staff accessing Admin-only route should return 403', async () => {
        try {
            // Kita coba akses route /api/users (yang biasanya cuma buat Admin) pakai token Staff
            await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${global.STAFF_TOKEN}` }
            });
            throw new Error('Staff should not access users list');
        } catch (error) {
            // Note: Pastikan route /api/users di backend memang diproteksi 'ADMIN'
            // Jika belum, test ini akan fail (which is good, berarti security hole ketemu)
            runner.assertStatus(error.response, 403); 
        }
    });
};

module.exports = run;