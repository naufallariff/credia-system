import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertCircle, Banknote, CalendarClock } from 'lucide-react';
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

// Helper: Status Styling
const getStatusConfig = (status) => {
    switch (status) {
        case 'PAID':
            return {
                badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            };
        case 'OVERDUE':
            return {
                badge: 'bg-destructive/15 text-destructive dark:text-red-400 border-destructive/20',
                icon: <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            };
        default:
            return {
                badge: 'bg-slate-500/10 text-muted-foreground border-border',
                icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            };
    }
};

export const AmortizationTable = ({ schedule, contractId, remainingLoan }) => {
    const { user } = useSession();
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const canProcessPayment = ['ADMIN', 'STAFF', 'SUPERADMIN'].includes(user?.role);

    if (!schedule || schedule.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20 text-muted-foreground">
                <CalendarClock className="h-10 w-10 mb-2 opacity-50" />
                <p>No payment schedule available yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="w-[80px] font-semibold text-foreground">Month</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Installment</TableHead>
                            <TableHead>Penalty</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Paid Date</TableHead>
                            {canProcessPayment && <TableHead className="w-[100px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedule.map((item) => {
                            const statusConfig = getStatusConfig(item.status);

                            return (
                                <TableRow key={item.month} className="hover:bg-muted/30 border-border transition-colors">
                                    <TableCell className="font-medium text-foreground">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                            {item.month}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-sm">
                                        {format(new Date(item.due_date), 'dd MMM yyyy')}
                                    </TableCell>

                                    <TableCell className="font-mono font-medium text-foreground">
                                        {formatRupiah(item.amount)}
                                    </TableCell>

                                    <TableCell>
                                        {item.penalty_paid > 0 ? (
                                            <span className="text-destructive text-xs font-semibold bg-destructive/10 px-2 py-1 rounded">
                                                +{formatRupiah(item.penalty_paid)}
                                            </span>
                                        ) : <span className="text-muted-foreground">-</span>}
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline" className={`flex w-fit items-center gap-1.5 px-2 py-0.5 ${statusConfig.badge}`}>
                                            {statusConfig.icon}
                                            <span className="text-[10px] font-bold uppercase">{item.status}</span>
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-right text-muted-foreground text-sm font-mono">
                                        {item.paid_at ? format(new Date(item.paid_at), 'dd/MM/yyyy HH:mm') : '-'}
                                    </TableCell>

                                    {/* Action Column */}
                                    {canProcessPayment && (
                                        <TableCell>
                                            {item.status !== 'PAID' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all w-full"
                                                    onClick={() => setSelectedInstallment(item)}
                                                >
                                                    <Banknote className="mr-2 h-3.5 w-3.5" /> Pay
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

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