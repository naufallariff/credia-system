import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Loader2 } from 'lucide-react';
import { useContracts } from '@/features/contract/use-contracts';
import { ContractTable } from '@/widgets/contract/contract-table';
import { PaginationControls } from '@/shared/ui/pagination-controls';

export const ApprovalPage = () => {
    const navigate = useNavigate();
    // 1. Pagination State
    const [page, setPage] = useState(1);

    // 2. Fetch Data
    const { data, isLoading, isPlaceholderData } = useContracts(page, 10, '');

    // 3. Safe Extraction
    const allContracts = data?.contracts || [];
    const pagination = data?.pagination || {};

    // 4. Client-side Filtering
    const pendingContracts = allContracts.filter(c => c.status === 'PENDING_ACTIVATION');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/15 rounded-lg text-amber-600 dark:text-amber-400 border border-amber-500/10">
                    <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Approval Queue</h1>
                    <p className="text-muted-foreground text-sm">Review and validate pending loan applications.</p>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm relative min-h-[400px] overflow-hidden">

                {/* Loading Overlay */}
                {isLoading && !isPlaceholderData && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                <div className="p-4 border-b border-border bg-muted/30">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                        Pending Requests
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                            Page {page}
                        </span>
                    </h2>
                </div>

                {/* Data Table */}
                <ContractTable data={pendingContracts} isLoading={isLoading && !isPlaceholderData} />

                {/* Pagination Controls */}
                {!isLoading && allContracts.length > 0 && (
                    <div className="border-t border-border">
                        <PaginationControls
                            currentPage={pagination.current_page}
                            totalPages={pagination.total_pages}
                            hasPrev={pagination.has_prev}
                            hasNext={pagination.has_next}
                            onPageChange={(newPage) => setPage(newPage)}
                            isLoading={isPlaceholderData}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};