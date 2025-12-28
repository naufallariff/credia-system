import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { ShieldAlert } from 'lucide-react';

const ChangeInitialPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Removed 'login' and 'navigate' as they were unused
    const { tempToken, logout } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Use the temporary token for this request
            const config = {
                headers: { Authorization: `Bearer ${tempToken}` }
            };

            const res = await api.post('/auth/change-initial-password', { newPassword }, config);

            if (res.data.success) {
                const { token, user } = res.data.data;

                // Update Local Storage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Force a hard reload to re-initialize the App with the new Full Access Token
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-amber-100 p-4 flex items-start gap-3 border-b border-amber-200">
                    <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                    <div>
                        <h3 className="text-amber-800 font-bold text-sm uppercase tracking-wide">Security Action Required</h3>
                        <p className="text-amber-700 text-sm mt-1">
                            Your account is using a temporary password. You must set a secure password to proceed.
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={logout}
                                className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors"
                            >
                                {isSubmitting ? 'Updating...' : 'Set Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangeInitialPassword;