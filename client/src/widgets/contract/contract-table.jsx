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
            <div className="flex flex-col items-center justify-center h-64 border border-border border-dashed rounded-lg bg-muted/20">
                <div className="p-4 bg-background rounded-full mb-3 border border-border">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No contracts found</h3>
                <p className="text-sm text-muted-foreground max-w-sm text-center mt-1">
                    There are no contracts in the system yet. Start by creating a new application.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[150px] text-muted-foreground">Contract No</TableHead>
                        <TableHead className="text-muted-foreground">Client Name</TableHead>
                        <TableHead className="text-muted-foreground">Principal / OTR</TableHead>
                        <TableHead className="text-muted-foreground">Installment</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-right text-muted-foreground">Created Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((contract) => (
                        <TableRow key={contract._id} className="hover:bg-muted/50 transition-colors border-border">
                            <TableCell className="font-medium font-mono text-xs text-muted-foreground">
                                {contract.contract_no || <span className="italic opacity-70">Draft</span>}
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{contract.client?.name}</span>
                                    <span className="text-xs text-muted-foreground">{contract.client?.custom_id}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{formatRupiah(contract.principal_amount)}</span>
                                    <span className="text-xs text-muted-foreground">OTR: {formatRupiah(contract.otr_price)}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-foreground">{formatRupiah(contract.monthly_installment)}</span>
                                    <span className="text-xs text-muted-foreground">{contract.duration_month} months</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <Badge variant="outline" className={`${getStatusColor(contract.status)} border-border px-2 py-0.5`}>
                                    {getStatusLabel(contract.status)}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-right text-muted-foreground text-sm">
                                {contract.created_at ? format(new Date(contract.created_at), 'dd MMM yyyy') : '-'}
                            </TableCell>

                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
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
                                        <DropdownMenuItem className="text-muted-foreground opacity-50 cursor-not-allowed">
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
        <div className="rounded-md border border-border bg-card p-4">
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