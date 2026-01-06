import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { useContracts } from '@/features/contract/use-contracts';
import { ContractTable } from '@/widgets/contract/contract-table';

export const ApprovalPage = () => {
    // Use existing hook, but in real app we might pass a filter param
    // client-side filtering for now
    const { data: allContracts, isLoading } = useContracts();

    const pendingContracts = allContracts
        ? allContracts.filter(c => c.status === 'PENDING_ACTIVATION')
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
                    <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Approval Queue</h1>
                    <p className="text-slate-500 text-sm">Review and validate pending loan applications.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-semibold text-slate-800">Pending Requests ({pendingContracts.length})</h2>
                </div>

                {/* Reuse the Table Widget */}
                <ContractTable data={pendingContracts} isLoading={isLoading} />
            </div>
        </div>
    );
};