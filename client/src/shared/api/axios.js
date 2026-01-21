import axios from 'axios';

// Configure Base URL
// Using Vite proxy '/api' to avoid CORS issues during development
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10s timeout
});

// Request Interceptor: Auto-inject JWT Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global Errors (e.g., Token Expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If 401 Unauthorized (Invalid/Expired Token), log user out
        if (error.response && error.response.status === 401) {
            // Prevent redirect loop if already on login page
            if (error.config.url.includes('/auth/login')) {
                return Promise.reject(error);
            }

            if (!window.location.pathname.includes('/auth/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('credia-session-storage');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;