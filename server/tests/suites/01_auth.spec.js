const axios = require('axios');
const runner = require('../lib/TestRunner');

const API_URL = 'http://localhost:5000/api';

const run = async () => {
    runner.group('Authentication & Security V3.0');

    // 1. Admin Login
    await runner.test('Login: Valid Admin credentials', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin.finance',
            password: 'AdminPassword!23'
        });
        runner.assertStatus(res, 200);
        global.ADMIN_TOKEN = res.data.data.token;
    });

    // 2. Staff Login
    await runner.test('Login: Valid Staff credentials', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'staff.sales',
            password: 'StaffPassword!23'
        });
        runner.assertStatus(res, 200);
        global.STAFF_TOKEN = res.data.data.token;
    });

    // 3. Client Login
    await runner.test('Login: Valid Client credentials', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'client.andri',
            password: 'UserPassword!23'
        });
        runner.assertStatus(res, 200);
        global.CLIENT_TOKEN = res.data.data.token;
    });

    // 4. Invalid Login
    await runner.test('Login: Invalid credentials rejection', async () => {
        try {
            await axios.post(`${API_URL}/auth/login`, {
                username: 'staff.sales',
                password: 'WrongPassword'
            });
            throw new Error('Should have failed');
        } catch (error) {
            runner.assertStatus(error.response, 401);
        }
    });
};

module.exports = run;