const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAuth = async () => {
    console.log('--- TEST 1: Login Admin (Valid) ---');
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin_sys',
            password: 'secureAdminPassword!23'
        });
        
        if (res.data.success) {
            console.log('✅ Token:', res.data.data.token.substring(0, 20) + '...');
            
            // Test Get Profile
            console.log('\n--- TEST 2: Akses Data Pribadi (Dengan Token) ---');
            const resMe = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${res.data.data.token}` }
            });
            console.log(`✅ Profile: ${resMe.data.data.username} (${resMe.data.data.role})`);
        }
    } catch (error) {
        console.error('❌ Login Failed:', error.response ? error.response.data : error.message);
    }

    console.log('\n--- TEST 3: Login Salah (Invalid) ---');
    try {
        await axios.post(`${API_URL}/auth/login`, {
            username: 'admin_sys',
            password: 'salahpassword'
        });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ Server Response: 401 Invalid credentials (Sesuai Harapan)');
        } else {
            console.error('❌ Unexpected Error:', error.message);
        }
    }
};

testAuth();