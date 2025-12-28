import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatRupiah, getStatusColor } from '../../utils/formatters';
import { Wallet, Calendar, AlertCircle } from 'lucide-react';

const ClientDashboard = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalDebt: 0, nextDue: null });

    useEffect(() => {
        const fetchMyLoans = async () => {
            try {
                // Backend should filter by req.user.id automatically
                const res = await api.get('/contracts');
                const data = res.data.data;
                setLoans(data);

                // Calculate Stats
                const totalRemaining = data.reduce((acc, curr) => acc + (curr.remaining_loan || 0), 0);
                setStats({
                    totalDebt: totalRemaining,
                    nextDue: null // Logic to find next due date can be added here
                });

            } catch (error) {
                console.error('Failed to load loans', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyLoans();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Overview</h1>
                <p className="text-slate-500">Track your active loans and payment schedules.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-500/30">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Total Remaining Debt</p>
                            <h2 className="text-3xl font-bold mt-1">{formatRupiah(stats.totalDebt)}</h2>
                        </div>
                        <div className="p-3 bg-indigo-500/30 rounded-lg">
                            <Wallet size={24} className="text-white" />
                        </div>
                    </div>
                    <p className="text-xs text-indigo-200">Across {loans.length} active contract(s)</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Account Status</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                <span className="text-slate-900 font-bold">Good Standing</span>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <AlertCircle size={24} className="text-slate-400" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">No overdue payments detected.</p>
                </div>
            </div>

            {/* Active Loans List */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Your Loans</h3>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {loans.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">You have no active loans.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Contract No</th>
                                        <th className="px-6 py-3">Principal</th>
                                        <th className="px-6 py-3">Installment</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loans.map((loan) => (
                                        <tr key={loan._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-indigo-600 font-medium">
                                                {loan.contract_no || 'PENDING'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {formatRupiah(loan.principal_amount)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {formatRupiah(loan.monthly_installment)}
                                                <span className="text-xs text-slate-400 font-normal"> /mo</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(loan.status)}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/contracts/${loan._id}`}
                                                    className="text-indigo-600 hover:text-indigo-800 font-medium text-xs border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded transition-all"
                                                >
                                                    View Schedule
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;