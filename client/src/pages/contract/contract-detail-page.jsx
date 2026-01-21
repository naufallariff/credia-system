import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react';

import { useContractDetail } from '@/features/contract/use-contract-detail';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

// --- WIDGET IMPORTS ---
import { AdminActionBar } from '@/widgets/contract/admin-action-bar';
import { AmortizationTable } from '@/widgets/contract/amortization-table';
import { PrintContractButton } from '@/widgets/contract/print-contract-button';
import { ContractInfo } from '@/widgets/contract/contract-info'; // Pastikan ini diimport

export const ContractDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: contract, isLoading, error } = useContractDetail(id);

    if (isLoading) return <DetailSkeleton />;
    if (error) return <div className="p-8 text-center text-destructive">Failed to load contract details.</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                    <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                    </Button>

                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">
                            {contract.contract_no || 'New Application'}
                        </h1>
                        <Badge variant="outline" className={
                            contract.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : contract.status === 'VOID'
                                    ? 'bg-destructive/15 text-destructive border-destructive/20'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }>
                            {contract.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {contract.client?.name}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {contract.duration_month} Months</span>
                    </div>
                </div>

                {/* --- ACTION BUTTONS (TOP RIGHT) --- */}
                <div className="flex items-center gap-2">
                    <PrintContractButton contract={contract} />

                    {contract.status === 'PENDING_ACTIVATION' && (
                        <Button variant="secondary">Edit Details</Button>
                    )}
                </div>
            </div>

            {/* --- ADMIN ACTION BAR --- */}
            <AdminActionBar contractId={contract._id} status={contract.status} />

            {/* --- MAIN TABS --- */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none py-3 px-1 text-muted-foreground"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="schedule"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none py-3 px-1 text-muted-foreground"
                    >
                        Amortization Schedule
                    </TabsTrigger>
                    <TabsTrigger
                        value="documents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none py-3 px-1 text-muted-foreground"
                    >
                        Documents
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ContractInfo contract={contract} />
                    </TabsContent>

                    <TabsContent value="schedule" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <AmortizationTable
                            schedule={contract.amortization}
                            contractId={contract._id}
                            remainingLoan={contract.remaining_loan}
                        />
                    </TabsContent>

                    <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                            <FileText className="h-10 w-10 mb-2 opacity-50" />
                            <p>Uploaded documents (KTP, KK, Slip Gaji) will appear here.</p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

const DetailSkeleton = () => (
    <div className="space-y-6 max-w-5xl mx-auto pt-10">
        <Skeleton className="h-8 w-1/3 bg-muted" />
        <Skeleton className="h-[200px] w-full bg-muted" />
    </div>
);