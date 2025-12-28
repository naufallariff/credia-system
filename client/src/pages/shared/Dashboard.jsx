import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatRupiah } from '../../utils/formatters';
import StatCard from '../../components/ui/StatCard';
import {
    Briefcase,
    FileText,
    Users,
    AlertCircle,
    ArrowRight,
    TrendingUp
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        activeContracts: 0,
        totalPortfolio: 0,
        pendingTickets: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Parallel data fetching for performance
                const [contractsRes, ticketsRes, usersRes] = await Promise.allSettled([
                    api.get('/contracts'),
                    api.get('/tickets?status=PENDING'),
                    user.role.includes('ADMIN') ? api.get('/users') : Promise.resolve({ data: { data: [] } })
                ]);

                // Process Contracts
                const contracts = contractsRes.status === 'fulfilled' ? contractsRes.value.data.data : [];
                const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
                const totalPortfolio = activeContracts.reduce((sum, c) => sum + (c.principal_amount || 0), 0);

                // Process Tickets
                const pendingTickets = ticketsRes.status === 'fulfilled' ? ticketsRes.value.data.data.length : 0;

                // Process Users (Admin only)
                const totalUsers = usersRes.status === 'fulfilled' ? usersRes.value.data.data.length : 0;

                setStats({
                    activeContracts: activeContracts.length,
                    totalPortfolio,
                    pendingTickets,
                    totalUsers
                });

            } catch (error) {
                console.error('Dashboard data load failed', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.role]);

    if (loading) return <div className="p-8 text-slate-500">Loading dashboard analytics...</div>;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
                    <p className="text-slate-500 text-sm">Welcome back, {user.name}. Here's what's happening today.</p>
                </div>
                <div className="hidden md:block">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Portfolio"
                    value={formatRupiah(stats.totalPortfolio)}
                    icon={TrendingUp}
                    color="indigo"
                    subtext="Total principal outstanding"
                />
                <StatCard
                    title="Active Contracts"
                    value={stats.activeContracts}
                    icon={Briefcase}
                    color="green"
                    subtext="Loans currently running"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingTickets}
                    icon={FileText}
                    color={stats.pendingTickets > 0 ? 'amber' : 'slate'}
                    subtext="Requires Admin attention"
                />
                {user.role.includes('ADMIN') && (
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={Users}
                        color="rose"
                        subtext="Staff, Clients, and Leads"
                    />
                )}
            </div>

            {/* Quick Actions / Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Action Center */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-slate-400" /> Action Center
                    </h3>
                    <div className="space-y-3">
                        {user.role === 'STAFF' && (
                            <Link to="/contracts/new" className="block p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-slate-700 group-hover:text-indigo-600">Create New Contract</h4>
                                        <p className="text-xs text-slate-500">Initiate a loan application for a client.</p>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
                                </div>
                            </Link>
                        )}

                        {user.role.includes('ADMIN') && (
                            <Link to="/approvals" className="block p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-slate-700 group-hover:text-indigo-600">Review Pending Approvals</h4>
                                        <p className="text-xs text-slate-500">Process {stats.pendingTickets} tickets waiting for decision.</p>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
                                </div>
                            </Link>
                        )}

                        <Link to="/contracts" className="block p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-slate-700 group-hover:text-indigo-600">Browse Contract Directory</h4>
                                    <p className="text-xs text-slate-500">Search and manage all contracts.</p>
                                </div>
                                <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-2">Credia Enterprise V3.0</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            System is running normally. All financial engines are active and secured.
                        </p>
                        <div className="flex gap-4 text-xs font-mono text-slate-500">
                            <div className="flex flex-col">
                                <span className="uppercase tracking-wider">Server Status</span>
                                <span className="text-green-400 font-bold">ONLINE</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="uppercase tracking-wider">Database</span>
                                <span className="text-green-400 font-bold">CONNECTED</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600 rounded-full opacity-20 blur-2xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;