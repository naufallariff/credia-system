import React from 'react';
import { CreditCard, Eye, AlertCircle } from 'lucide-react';

const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
    }).format(num);
};

const ContractTable = ({ contracts = [], isLoading, onPayClick }) => {
    // Check permission for Payment Button
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const canPay = ['ADMIN', 'STAFF'].includes(user.role);

    if (isLoading) {
    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
        </div>
    );
    }

    if (contracts.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 border-dashed text-center">
        <div className="p-3 bg-slate-50 rounded-full mb-4">
            <AlertCircle className="text-slate-400" size={24} />
        </div>
        <h3 className="text-slate-900 font-medium">No Contracts Found</h3>
        <p className="text-slate-500 text-sm mt-1">There are no active contracts to display.</p>
        </div>
    );
    }

    return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contract No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Loan Value</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Installment</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {contracts.map((contract) => (
                <tr key={contract._id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                    <span className="font-semibold text-credia-700 font-mono text-sm">{contract.contract_no}</span>
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{contract.client_name_snapshot}</div>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="text-sm text-slate-600">{formatRupiah(contract.otr_price)}</div>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-slate-800">{formatRupiah(contract.monthly_installment)}</div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border
                    ${contract.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                    ${contract.status === 'LATE' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                    ${contract.status === 'CLOSED' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                    `}>
                    {contract.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                    <button className="text-slate-400 hover:text-credia-600 transition-colors p-1.5 rounded-md hover:bg-credia-50" title="View Details">
                    <Eye size={18} />
                    </button>
                    {canPay && contract.status !== 'CLOSED' && (
                    <button 
                        onClick={() => onPayClick(contract._id)}
                        className="text-emerald-600 hover:text-emerald-700 transition-colors p-1.5 rounded-md hover:bg-emerald-50" 
                        title="Pay Installment"
                    >
                        <CreditCard size={18} />
                    </button>
                    )}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
    );
};

export default ContractTable;