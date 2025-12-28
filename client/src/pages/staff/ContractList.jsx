import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatRupiah, getStatusColor } from '../../utils/formatters';
import { Plus, Search, FileText, Filter } from 'lucide-react';

const ContractList = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, PENDING
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await api.get('/contracts');
                setContracts(res.data.data);
            } catch (error) {
                console.error('Failed to load contracts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    // Client-Side Filtering (Dynamic)
    const filteredContracts = contracts.filter((c) => {
        const matchesStatus = filter === 'ALL' ||
            (filter === 'PENDING' ? ['PENDING_ACTIVATION', 'DRAFT'].includes(c.status) : c.status === filter);

        const matchesSearch =
            c.contract_no?.toLowerCase().includes(search.toLowerCase()) ||
            c.client?.name?.toLowerCase().includes(search.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Contract Management</h1>
                    <p className="text-slate-500 text-sm">Monitor and manage loan portfolio.</p>
                </div>
                <Link
                    to="/contracts/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all"
                >
                    <Plus size={18} /> New Contract
                </Link>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Contract No or Client Name..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'PENDING', 'CLOSED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading data...</div>
                ) : filteredContracts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-slate-900 font-medium">No Contracts Found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your filters or create a new one.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Contract No</th>
                                    <th className="px-6 py-3">Client</th>
                                    <th className="px-6 py-3">Asset Value (OTR)</th>
                                    <th className="px-6 py-3">Installment</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredContracts.map((contract) => (
                                    <tr key={contract._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                                            {contract.contract_no || 'DRAFT'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {contract.client?.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {formatRupiah(contract.otr_price)}
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            {formatRupiah(contract.monthly_installment)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(contract.status)}`}>
                                                {contract.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/contracts/${contract._id}`}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                                            >
                                                View Details
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
    );
};

export default ContractList;