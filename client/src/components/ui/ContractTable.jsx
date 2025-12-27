import React from 'react';
import { formatRupiah, formatDate } from '../../utils/format';
import { Eye } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: "bg-blue-100 text-blue-700 border-blue-200",
        CLOSED: "bg-emerald-100 text-emerald-700 border-emerald-200", // Lunas
        LATE: "bg-amber-100 text-amber-700 border-amber-200", // Telat biasa
        OVERDUE: "bg-red-100 text-red-700 border-red-200", // Macet parah (kena denda)
    };

    // Default ke abu-abu jika status tidak dikenali
    const className = styles[status] || "bg-slate-100 text-slate-700 border-slate-200";

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
            {status}
        </span>
    );
};

export const ContractTable = ({ data, onViewDetail }) => {
    if (!data || data.length === 0) {
        return <div className="p-8 text-center text-slate-500">Belum ada data kontrak.</div>;
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-3">No. Kontrak</th>
                        <th className="px-6 py-3">Klien</th>
                        <th className="px-6 py-3">Total Pinjaman</th>
                        <th className="px-6 py-3 text-center">Tenor</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={item.contract_no}
                            className={`border-b hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                        >
                            <td className="px-6 py-4 font-medium text-primary">
                                {item.contract_no}
                            </td>
                            <td className="px-6 py-4">
                                {item.client_name}
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-700">
                                {formatRupiah(item.otr_price)} {/* Asumsi menampilkan OTR dulu */}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {item.duration_month} Bln
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge status={item.status} />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    onClick={() => onViewDetail(item.contract_no)}
                                    className="p-2 text-primary hover:bg-slate-200 rounded-full transition-all"
                                    title="Lihat Detail"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};