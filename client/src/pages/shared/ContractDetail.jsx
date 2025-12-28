import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { formatRupiah, formatDate, getStatusColor } from '../../utils/formatters';
import { FileText, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

const ContractDetail = () => {
    const { id } = useParams();
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/contracts/${id}`);
                setContract(res.data.data);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading contract details...</div>;
    if (!contract) return <div className="p-8 text-center text-red-500">Contract not found.</div>;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {contract.contract_no || 'DRAFT CONTRACT'}
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(contract.status)}`}>
                            {contract.status}
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        Client: <span className="font-semibold text-slate-700">{contract.client?.name}</span>
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 text-sm">
                    <div className="text-right">
                        <p className="text-slate-400">Total Loan</p>
                        <p className="font-mono font-bold text-slate-800">{formatRupiah(contract.total_loan)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400">Remaining</p>
                        <p className="font-mono font-bold text-indigo-600">{formatRupiah(contract.remaining_loan)}</p>
                    </div>
                </div>
            </div>

            {/* AMORTIZATION TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" /> Payment Schedule
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Month</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-right">Penalty</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {contract.amortization.map((schedule) => (
                                <tr key={schedule.month} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-700">{schedule.month}</td>
                                    <td className="px-6 py-3 text-slate-600">{formatDate(schedule.due_date)}</td>
                                    <td className="px-6 py-3 text-right font-mono text-slate-700">
                                        {formatRupiah(schedule.amount)}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-red-500">
                                        {schedule.penalty_paid > 0 ? formatRupiah(schedule.penalty_paid) : '-'}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`
                      px-2 py-0.5 rounded text-xs font-bold
                      ${schedule.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}
                      ${schedule.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : ''}
                    `}>
                                            {schedule.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INFO CARD (Contract Details) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={18} /> Asset Details
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500">OTR Price</span>
                            <span className="font-medium">{formatRupiah(contract.otr_price)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Down Payment</span>
                            <span className="font-medium">{formatRupiah(contract.dp_amount)}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Principal</span>
                            <span className="font-medium">{formatRupiah(contract.principal_amount)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <DollarSign size={18} /> Loan Terms
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Interest Rate</span>
                            <span className="font-medium">{contract.interest_rate}% / Year</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500">Duration</span>
                            <span className="font-medium">{contract.duration_month} Months</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="text-slate-500">Monthly Installment</span>
                            <span className="font-medium text-indigo-600">{formatRupiah(contract.monthly_installment)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDetail;