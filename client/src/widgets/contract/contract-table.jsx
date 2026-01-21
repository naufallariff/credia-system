import { useNavigate, useLocation } from 'react-router-dom'; // FIX: Tambah useLocation
import {
    MoreHorizontal,
    Eye,
    FileText,
    SearchX
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
// Hapus import Tooltip jika file belum ada, atau biarkan jika sudah buat.
// import { Tooltip, ... } from "@/shared/ui/tooltip"; 

import { formatRupiah } from '@/entities/contract/model';
import { getStatusColor, getStatusLabel } from '@/entities/contract/ui-mappers';

export const ContractTable = ({ data, isLoading }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Sekarang ini aman karena sudah diimport

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // --- Empty State ---
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-card border-none">
                <div className="bg-muted/30 p-6 rounded-full mb-4 animate-in zoom-in-50 duration-500">
                    <SearchX className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No contracts found</h3>
                <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                    No contracts matching your criteria.
                </p>
                <Button onClick={() => navigate('/contracts/new')} variant="default">
                    Create First Contract
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full overflow-auto">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="w-[180px]">Contract Details</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Financials</TableHead>
                        <TableHead>Terms</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((contract) => (
                        <TableRow
                            key={contract._id}
                            className="group hover:bg-muted/30 transition-all border-border cursor-pointer"
                            // LOGIC NAVIGASI PINTAR DISINI
                            onClick={() => navigate(`/contracts/${contract._id}`, {
                                state: { from: location.pathname }
                            })}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground text-sm">
                                            {contract.contract_no || 'Draft'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {contract.created_at ? format(new Date(contract.created_at), 'dd MMM yyyy') : '-'}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{contract.client?.name}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{contract.client?.custom_id}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-bold text-foreground text-sm">{formatRupiah(contract.principal_amount)}</span>
                                    <span className="text-xs text-muted-foreground">OTR: {formatRupiah(contract.otr_price)}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{formatRupiah(contract.monthly_installment)}</span>
                                    <span className="text-xs text-muted-foreground">/ month for {contract.duration_month}mo</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`${getStatusColor(contract.status)} border px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm`}
                                >
                                    {getStatusLabel(contract.status)}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        // LOGIC NAVIGASI PINTAR JUGA DISINI
                                        onClick={() => navigate(`/contracts/${contract._id}`, {
                                            state: { from: location.pathname }
                                        })}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuLabel>Manage Contract</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => navigate(`/contracts/${contract._id}`)}>
                                                View Full Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem disabled={contract.status !== 'PENDING_ACTIVATION'}>
                                                Edit Application
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};