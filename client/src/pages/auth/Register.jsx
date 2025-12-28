import { useState } from 'react';
import { Link } from 'react-router-dom'; // Removed useNavigate
import { useAuth } from '../../hooks/useAuth';
import { UserPlus, Mail, User, Lock, CheckCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', username: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Removed useNavigate
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const result = await register(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.message);
        }
        setIsSubmitting(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Registration Successful!</h2>
                    <p className="text-slate-500 mt-2 mb-6">
                        Your account has been created. Please wait for an Administrator to verify your identity. You will receive an email once approved.
                    </p>
                    <Link to="/login" className="block w-full py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                    <p className="text-slate-500 mt-1 text-sm">Join the Credia System</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute top-3 left-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Legal Name"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute top-3 left-3 text-slate-400" size={18} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative">
                        <UserPlus className="absolute top-3 left-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            name="username"
                            placeholder="Choose Username"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute top-3 left-3 text-slate-400" size={18} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Create Password"
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        {isSubmitting ? 'Submitting...' : 'Register Now'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;