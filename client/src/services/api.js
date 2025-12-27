import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10s timeout for performance monitoring
});

// Request Interceptor: Secure Token Injection
api.interceptors.request.use(
    (config) => {
        try {
            const userStr = sessionStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        } catch (error) {
            console.error('Error parsing session data', error);
            sessionStorage.clear();
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Session Management
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Security: Immediate logout on 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem('user');
            // Prevent redirect loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;