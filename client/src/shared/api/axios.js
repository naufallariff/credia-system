import axios from 'axios';

// Konfigurasi Base URL
// Menggunakan proxy Vite '/api' untuk menghindari masalah CORS saat development
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 detik timeout
});

// Request Interceptor: Menyisipkan Token JWT otomatis
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Menangani Global Error (misal: Token Expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Jika 401 Unauthorized (Token invalid/expired), logout user
        if (error.response && error.response.status === 401) {
            // Cek apakah bukan di halaman login agar tidak loop redirect
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;