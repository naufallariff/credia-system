import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Users, UserCheck, UserX, Shield, Briefcase } from 'lucide-react';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'ACTIVE'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch based on tab context
            const statusQuery = activeTab === 'PENDING' ? 'UNVERIFIED' : 'ACTIVE';
            const res = await api.get(`/users?status=${statusQuery}`);
            setUsers(res.data.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleApproval = async (userId, action, targetRole = 'CLIENT') => {
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        setProcessingId(userId);
        try {
            // Backend expects: { action: 'APPROVE' | 'REJECT', targetRole: '...' }
            await api.put(`/users/${userId}/approve`, {
                action: action, // 'APPROVE' or 'REJECT'
                targetRole: targetRole
            });

            // Refresh list
            setUsers(prev => prev.filter(u => u._id !== userId));
            alert(`User ${action.toLowerCase()}d successfully.`);
        } catch (error) {
            alert(`Operation failed: ${error.response?.data?.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 text-sm">Manage access and verify new registrations.</p>
                </div>
            </div>

            {/* TABS */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'PENDING'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Pending Verification
                    {activeTab === 'PENDING' && users.length > 0 && (
                        <span className="ml-2 bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                            {users.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('ACTIVE')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'ACTIVE'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Active Directory
                </button>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading user data...</div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-slate-900 font-medium">No Users Found</h3>
                        <p className="text-slate-500 text-sm">There are no records in this category.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">User Profile</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                                    <div className="text-slate-400 text-xs mt-0.5 font-mono">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2 text-slate-600">
                                                {user.role === 'ADMIN' ? <Shield size={14} /> : <Briefcase size={14} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {activeTab === 'PENDING' && (
                                                <div className="flex justify-end gap-2">
                                                    {/* Reject Button */}
                                                    <button
                                                        onClick={() => handleApproval(user._id, 'REJECT')}
                                                        disabled={processingId === user._id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                        title="Reject & Ban"
                                                    >
                                                        <UserX size={18} />
                                                    </button>

                                                    {/* Approve as Client */}
                                                    <button
                                                        onClick={() => handleApproval(user._id, 'APPROVE', 'CLIENT')}
                                                        disabled={processingId === user._id}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <UserCheck size={14} /> Approve Client
                                                    </button>

                                                    {/* Approve as Staff (Secondary Action) */}
                                                    <button
                                                        onClick={() => handleApproval(user._id, 'APPROVE', 'STAFF')}
                                                        disabled={processingId === user._id}
                                                        className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                                                    >
                                                        As Staff
                                                    </button>
                                                </div>
                                            )}

                                            {activeTab === 'ACTIVE' && (
                                                <span className="text-slate-400 text-xs italic">Managed via Ticket</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;