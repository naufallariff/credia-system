import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, WalletCards } from 'lucide-react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Kirim Request Login
            const res = await api.post('/auth/login', formData);

            // 2. Simpan Sesi (Token & User Info)
            const { token, ...user } = res.data.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));

            // 3. Redirect ke Dashboard
            navigate('/dashboard');
        } catch (err) {
            // Handle Error dari Backend
            const msg = err.response?.data?.message || 'Gagal terhubung ke server';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">

                {/* Logo Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                        <WalletCards size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">IMS Finance</h1>
                    <p className="text-slate-500 text-sm mt-1">Professional Loan System</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-danger text-sm rounded-lg flex items-center border border-red-100 animate-pulse">
                        <LockKeyhole size={16} className="mr-2" />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Username"
                        placeholder="e.g. admin_sys"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <div className="mt-6">
                        <Button type="submit" isLoading={loading}>
                            Sign In to Dashboard
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-slate-400">
                    &copy; 2025 IMS Finance System. Ver 1.0.0
                </div>
            </div>
        </div>
    );
};

export default Login;