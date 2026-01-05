import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';

import { useContracts } from '@/features/contract/use-contracts';
import { ContractTable } from '@/widgets/contract/contract-table';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export const ContractListPage = () => {
    const navigate = useNavigate();
    const { data: contracts, isLoading } = useContracts();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contract Directory</h1>
                    <p className="text-slate-500 text-sm">Manage and track all loan applications and active contracts.</p>
                </div>
                <Button onClick={() => navigate('/contracts/new')} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Create New Contract
                </Button>
            </div>

            {/* Toolbar (Search & Filter) */}
            <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200 w-fit">
                <Input
                    placeholder="Search by client or contract no..."
                    className="w-64 border-none shadow-none focus-visible:ring-0 bg-transparent h-9"
                />
                <div className="h-6 w-px bg-slate-200"></div>
                <Button variant="ghost" size="sm" className="text-slate-500">
                    <Filter className="mr-2 h-3 w-3" /> Filters
                </Button>
            </div>

            {/* Main Data Grid */}
            <ContractTable data={contracts} isLoading={isLoading} />
        </div>
    );
};