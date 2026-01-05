import { useNavigate } from 'react-router-dom';
import {
    MoreHorizontal,
    Eye,
    FileEdit,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";

import { formatRupiah } from '@/entities/contract/model';
import { getStatusColor, getStatusLabel } from '@/entities/contract/ui-mappers';

export const ContractTable = ({ data, isLoading }) => {
    const navigate = useNavigate();

    if (isLoading) {
        return <TableSkeleton />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-slate-50 border-dashed">
                <div className="p-4 bg-white rounded-full mb-3">
                    <AlertCircle className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No contracts found</h3>
                <p className="text-sm text-slate-500 max-w-sm text-center mt-1">
                    There are no contracts in the system yet. Start by creating a new application.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="w-[150px]">Contract No</TableHead>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Principal / OTR</TableHead>
                        <TableHead>Installment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Created Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((contract) => (
                        <TableRow key={contract._id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-medium font-mono text-xs text-slate-600">
                                {contract.contract_no || <span className="text-slate-400 italic">Draft</span>}
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{contract.client?.name}</span>
                                    <span className="text-xs text-slate-500">{contract.client?.custom_id}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{formatRupiah(contract.principal_amount)}</span>
                                    <span className="text-xs text-slate-500">OTR: {formatRupiah(contract.otr_price)}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-slate-900">{formatRupiah(contract.monthly_installment)}</span>
                                    <span className="text-xs text-slate-500">{contract.duration_month} months</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <Badge variant="outline" className={`${getStatusColor(contract.status)} border px-2 py-0.5`}>
                                    {getStatusLabel(contract.status)}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-right text-slate-500 text-sm">
                                {contract.created_at ? format(new Date(contract.created_at), 'dd MMM yyyy') : '-'}
                            </TableCell>

                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigate(`/contracts/${contract._id}`)}>
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem disabled={contract.status !== 'PENDING_ACTIVATION'}>
                                            <FileEdit className="mr-2 h-4 w-4" /> Edit Request
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-slate-500" disabled>
                                            Download PDF
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

// Internal Skeleton Component
const TableSkeleton = () => (
    <div className="space-y-3">
        <div className="rounded-md border bg-white p-4">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </div>
    </div>
);