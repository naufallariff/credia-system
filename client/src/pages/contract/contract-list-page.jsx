import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Search } from 'lucide-react';

import { useContracts } from '@/features/contract/use-contracts';
import { ContractTable } from '@/widgets/contract/contract-table';
import { PaginationControls } from '@/shared/ui/pagination-controls';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export const ContractListPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading, isPlaceholderData } = useContracts(page, 10, search);

    const contracts = data?.contracts || [];
    const pagination = data?.pagination || {};

    return (
        <div className="space-y-6">
            {/* Header & Toolbar Tetap Sama ... */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Contract Directory</h1>
                    <p className="text-muted-foreground text-sm">Manage and track all loan applications.</p>
                </div>
                <Button onClick={() => navigate('/contracts/new')} className="shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Create New Contract
                </Button>
            </div>

            <div className="flex items-center gap-3 bg-card p-1 rounded-lg border border-border w-full sm:w-fit shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by contract no or client..." 
                        className="pl-9 border-none shadow-none focus-visible:ring-0 bg-transparent h-9 text-foreground placeholder:text-muted-foreground"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); 
                        }}
                    />
                </div>
            </div>

            {/* TABEL + PAGINATION SECTION */}
            <div className="bg-card rounded-xl border border-border shadow-sm relative min-h-[250px] overflow-hidden flex flex-col">
                
                {isLoading && !isPlaceholderData && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                
                <div className="flex-1">
                    <ContractTable data={contracts} isLoading={isLoading && !isPlaceholderData} />
                </div>
                
                <div className="border-t border-border">
                    <PaginationControls 
                        currentPage={pagination.current_page || 1}
                        totalPages={pagination.total_pages || 1}
                        hasPrev={pagination.has_prev}
                        hasNext={pagination.has_next}
                        onPageChange={(newPage) => setPage(newPage)}
                        isLoading={isPlaceholderData || isLoading}
                    />
                </div>
            </div>
        </div>
    );
};