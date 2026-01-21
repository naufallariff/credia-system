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
import { PrintContractButton } from '@/widgets/contract/print-contract-button'; // <--- IMPORT INI

export const ContractDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: contract, isLoading, error } = useContractDetail(id);

    if (isLoading) return <DetailSkeleton />;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load contract.</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                    <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent text-slate-500" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                    </Button>

                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {contract.contract_no || 'New Application'}
                        </h1>
                        <Badge className={
                            contract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                contract.status === 'VOID' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700 border-amber-200'
                        }>
                            {contract.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {contract.client?.name}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {contract.duration_month} Months</span>
                    </div>
                </div>

                {/* --- ACTION BUTTONS (TOP RIGHT) --- */}
                <div className="flex items-center gap-2">
                    {/* Tombol Cetak PDF */}
                    <PrintContractButton contract={contract} />

                    {/* Tombol Edit (Hanya jika masih draft, opsional) */}
                    {contract.status === 'PENDING_ACTIVATION' && (
                        <Button variant="secondary">Edit Details</Button>
                    )}
                </div>
            </div>

            {/* --- ADMIN ACTION BAR (Approval Workflow) --- */}
            <AdminActionBar contractId={contract._id} status={contract.status} />

            {/* --- MAIN TABS --- */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-1">Overview</TabsTrigger>
                    <TabsTrigger value="schedule" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-1">Amortization Schedule</TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-1">Documents</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="overview">
                        {/* ... Isi Overview Component Anda (Summary Card, Client Info Card) ... */}
                        <div className="p-4 bg-slate-50 border rounded-lg text-center text-slate-500">
                            Loan Overview Component Placeholder
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule">
                        <AmortizationTable
                            schedule={contract.amortization}
                            contractId={contract._id}
                            remainingLoan={contract.remaining_loan}
                        />
                    </TabsContent>

                    <TabsContent value="documents">
                        <div className="p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
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
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[200px] w-full" />
    </div>
);