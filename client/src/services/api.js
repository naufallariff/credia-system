import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor: Attach Token
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

// Response Interceptor: Error Handling & Data Unwrapping
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const originalRequest = error.config;

        // Log error for debugging (Development only) - Using Vite's env check
        if (import.meta.env.DEV) {
            const traceId = error.response?.data?.trace_id || 'N/A';
            console.error(`[API ERROR] Trace: ${traceId} | URL: ${originalRequest.url}`);
        }

        // Handle 401 Unauthorized (Token Expired or Invalid)
        if (error.response?.status === 401 && !originalRequest._retry) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        const errorMessage = error.response?.data?.message || 'An unexpected network error occurred.';
        return Promise.reject({ ...error, message: errorMessage });
    }
);

export default api;