import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';

import { useContractDetail } from '@/features/contract/use-contract-detail';
import { ContractInfo } from '@/widgets/contract/contract-info';
import { AmortizationTable } from '@/widgets/contract/amortization-table';

import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { getStatusColor, getStatusLabel } from '@/entities/contract/ui-mappers';

export const ContractDetailPage = () => {
    const navigate = useNavigate();
    const { data: contract, isLoading, isError } = useContractDetail();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-slate-500">Loading contract details...</p>
            </div>
        );
    }

    if (isError || !contract) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-900">Contract Not Found</h2>
                <Button variant="link" onClick={() => navigate('/contracts')}>Back to Directory</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/contracts')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {contract.contract_no || 'Draft Contract'}
                            </h1>
                            <Badge className={`${getStatusColor(contract.status)} border`}>
                                {getStatusLabel(contract.status)}
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            Submission ID: <span className="font-mono">{contract.submission_id}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <ContractInfo contract={contract} />
                </TabsContent>

                <TabsContent value="schedule" className="mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900">Repayment Schedule</h3>
                            <p className="text-sm text-slate-500">
                                Track monthly installments and payment status.
                            </p>
                        </div>
                        <AmortizationTable schedule={contract.amortization} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};