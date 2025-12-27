import axios from 'axios';

// Instance Axios Terpusat
const api = axios.create({
    baseURL: '/api', // Otomatis mengarah ke localhost:5000 via Proxy Vite
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor Request: Pasang Token Otomatis
// Setiap kali kirim data, cek apakah ada tiket (token) di saku (sessionStorage)
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor Response: Handle Token Expired
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Jika server bilang "401 Unauthorized" (Token Basi/Palsu)
        if (error.response && error.response.status === 401) {
            sessionStorage.clear(); // Hapus data sampah
            window.location.href = '/login'; // Tendang ke login
        }
        return Promise.reject(error);
    }
);

export default api;