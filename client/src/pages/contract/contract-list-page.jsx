import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';

import { useContracts } from '@/features/contract/use-contracts';
import { ContractTable } from '@/widgets/contract/contract-table';
import { PaginationControls } from '@/shared/ui/pagination-controls';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export const ContractListPage = () => {
    const navigate = useNavigate();

    // 1. Local State for Pagination & Search
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    // 2. Fetch Data using updated Hook
    const { data, isLoading, isPlaceholderData } = useContracts(page, 10, search);

    // Safe extraction of data
    const contracts = data?.contracts || [];
    const pagination = data?.pagination || {};

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Contract Directory</h1>
                    <p className="text-muted-foreground text-sm">Manage and track all loan applications.</p>
                </div>
                <Button onClick={() => navigate('/contracts/new')} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Create New Contract
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 bg-card p-1 rounded-lg border border-border w-fit">
                <Input
                    placeholder="Search by contract no or client..."
                    className="w-72 border-none shadow-none focus-visible:ring-0 bg-transparent h-9 text-foreground placeholder:text-muted-foreground"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // Reset to page 1 on search
                    }}
                />
            </div>

            {/* Main Data Grid */}
            <div className="relative min-h-[400px]">
                {isLoading && !isPlaceholderData ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : null}

                <ContractTable data={contracts} isLoading={isLoading && !isPlaceholderData} />

                {/* Pagination Controls Integration */}
                {!isLoading && contracts.length > 0 && (
                    <PaginationControls
                        currentPage={pagination.current_page}
                        totalPages={pagination.total_pages}
                        hasPrev={pagination.has_prev}
                        hasNext={pagination.has_next}
                        onPageChange={(newPage) => setPage(newPage)}
                        isLoading={isPlaceholderData}
                    />
                )}
            </div>
        </div>
    );
};