import { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [tempToken, setTempToken] = useState(null);

    // Define logout first (Hoisting Fix)
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setTempToken(null);
    }, []);

    // Initialize Auth State on Load
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.data);
                } catch (error) {
                    console.error('[AUTH] Token validation failed:', error.message);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [logout]);

    const login = useCallback(async (username, password) => {
        try {
            const res = await api.post('/auth/login', { username, password });
            const { data } = res.data;

            if (data.require_password_change) {
                setTempToken(data.temp_token);
                return {
                    success: true,
                    status: 'PASSWORD_CHANGE_REQUIRED',
                    message: data.message
                };
            }

            const { token: newToken, user: userData } = data;
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setToken(newToken);
            setUser(userData);

            return { success: true, status: 'ACTIVE' };

        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    }, []);

    const register = useCallback(async (payload) => {
        try {
            await api.post('/auth/register', payload);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        tempToken,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!token,
        role: user?.role
    }), [user, token, tempToken, loading, login, logout, register]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};