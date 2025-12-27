import { useEffect, useState } from "react";
import api from "../services/api";
import {
DollarSign,
FileCheck,
TrendingUp,
Wallet,
Shield,
} from "lucide-react";
import ContractTable from "../components/ui/ContractTable";

const Dashboard = () => {
const [user, setUser] = useState({});
const [stats, setStats] = useState({
    totalContracts: 0,
    totalLoanValue: 0,
    activeContracts: 0,
    contracts: [],
});
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    // 1. Load User Session
    const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
    setUser(userData);

    const fetchData = async () => {
    try {
        // 2. Fetch Data (Backend filters automatically by Role)
        const res = await api.get("/contracts");
        const data = res.data.data.contracts;

        // 3. Calculate Analytics (Safe for both Admin and Client)
        const totalValue = data.reduce((acc, curr) => acc + curr.total_loan, 0);
        const activeCount = data.filter((c) => c.status === "ACTIVE").length;

        setStats({
        totalContracts: data.length,
        totalLoanValue: totalValue,
        activeContracts: activeCount,
        contracts: data,
        });
    } catch (err) {
        console.error("Dashboard Load Error:", err);
        setError("Unable to synchronize data with server.");
    } finally {
        setLoading(false);
    }
    };

    fetchData();
}, []);

const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    }).format(num);
};

// 4. Role-Based Wording
const isClient = user.role === "CLIENT";
const kpiTitles = {
    loan: isClient ? "My Total Loan" : "Portfolio Value",
    count: isClient ? "My Contracts" : "Total Contracts",
    active: isClient ? "Active Loans" : "Active Portfolio",
};

if (error)
    return (
    <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        <div className="font-bold mb-1">System Alert</div>
        {error}
    </div>
    );

return (
    <div className="space-y-8 animate-in fade-in duration-500">
    {/* Header Section */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
        </h2>
        <p className="text-slate-500 text-sm mt-1">
            Real-time financial monitoring.
        </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
        <Shield size={16} className="text-credia-600" />
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {user.role || "GUEST"} VIEW
        </span>
        </div>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Monetary Value */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-credia-300 transition-colors">
        <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={64} className="text-credia-700" />
        </div>
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-credia-50 text-credia-600 rounded-lg">
            <Wallet size={20} />
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {kpiTitles.loan}
            </h3>
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {loading ? "..." : formatRupiah(stats.totalLoanValue)}
        </p>
        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-credia-500 w-3/4 rounded-full"></div>
        </div>
        </div>

        {/* Card 2: Volume */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileCheck size={20} />
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {kpiTitles.count}
            </h3>
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {loading ? "..." : stats.totalContracts}
        </p>
        <p className="text-xs text-slate-400 mt-2">Recorded in system</p>
        </div>

        {/* Card 3: Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp size={20} />
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {kpiTitles.active}
            </h3>
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {loading ? "..." : stats.activeContracts}
        </p>
        <p className="text-xs text-emerald-600 mt-2 font-medium">
            Status: Healthy
        </p>
        </div>
    </div>

    {/* Data Table Section */}
    <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-slate-800">
            {isClient ? "My Loan History" : "Recent Contract Acquisitions"}
        </h3>
        </div>

        <ContractTable contracts={stats.contracts} isLoading={loading} />
    </div>
    </div>
);
};

export default Dashboard;
