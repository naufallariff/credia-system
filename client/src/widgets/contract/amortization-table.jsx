import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertCircle, Banknote } from 'lucide-react';
import { useSession } from '@/shared/model/use-session';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { formatRupiah } from '@/entities/contract/model';

import { Button } from "@/shared/ui/button";
import { PaymentModal } from '@/widgets/payment/payment-modal';

const getStatusBadge = (status) => {
    switch (status) {
        case 'PAID':
            return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25">Paid</Badge>;
        case 'OVERDUE':
            return <Badge className="bg-destructive/15 text-destructive dark:text-red-400 border-destructive/20 hover:bg-destructive/25">Overdue</Badge>;
        default:
            return <Badge variant="outline" className="text-muted-foreground border-border">Unpaid</Badge>;
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'PAID':
            return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        case 'OVERDUE':
            return <AlertCircle className="h-4 w-4 text-destructive" />;
        default:
            return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
};

export const AmortizationTable = ({ schedule, contractId, remainingLoan }) => {
    const { user } = useSession();
    const [selectedInstallment, setSelectedInstallment] = useState(null);

    const canProcessPayment = ['ADMIN', 'STAFF', 'SUPERADMIN'].includes(user?.role);

    if (!schedule || schedule.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No schedule generated.</div>;
    }

    return (
        <>
            <div className="rounded-md border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="w-[80px] text-muted-foreground">Month</TableHead>
                            <TableHead className="text-muted-foreground">Due Date</TableHead>
                            <TableHead className="text-muted-foreground">Installment</TableHead>
                            <TableHead className="text-muted-foreground">Penalty</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground">Paid Date</TableHead>
                            {canProcessPayment && <TableHead className="w-[100px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedule.map((item) => (
                            <TableRow key={item.month} className={`${item.status === 'PAID' ? 'bg-muted/30' : ''} border-border hover:bg-muted/40`}>
                                <TableCell className="font-medium text-foreground">#{item.month}</TableCell>
                                <TableCell className="text-foreground">{format(new Date(item.due_date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="font-mono font-medium text-foreground">{formatRupiah(item.amount)}</TableCell>
                                <TableCell className="text-destructive text-xs font-medium">
                                    {item.penalty_paid > 0 ? formatRupiah(item.penalty_paid) : '-'}
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(item.status)}
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="text-right text-muted-foreground text-sm">
                                    {item.paid_at ? format(new Date(item.paid_at), 'dd MMM yyyy HH:mm') : '-'}
                                </TableCell>

                                {/* Payment Action Column */}
                                {canProcessPayment && (
                                    <TableCell>
                                        {item.status !== 'PAID' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs border-primary text-primary hover:bg-primary/10 hover:text-primary"
                                                onClick={() => setSelectedInstallment(item)}
                                            >
                                                <Banknote className="mr-2 h-3 w-3" /> Pay
                                            </Button>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Payment Modal Integration */}
            <PaymentModal
                contractId={contractId}
                installment={selectedInstallment}
                isOpen={!!selectedInstallment}
                onClose={() => setSelectedInstallment(null)}
                remainingLoan={remainingLoan}
            />
        </>
    );
};