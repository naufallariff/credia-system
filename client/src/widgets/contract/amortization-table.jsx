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
            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Paid</Badge>;
        case 'OVERDUE':
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Overdue</Badge>;
        default:
            return <Badge variant="outline" className="text-slate-500">Unpaid</Badge>;
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'PAID':
            return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        case 'OVERDUE':
            return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
            return <Clock className="h-4 w-4 text-slate-300" />;
    }
};

export const AmortizationTable = ({ schedule, contractId, remainingLoan }) => {
    const { user } = useSession();
    const [selectedInstallment, setSelectedInstallment] = useState(null);

    const canProcessPayment = ['ADMIN', 'STAFF', 'SUPERADMIN'].includes(user?.role);

    if (!schedule || schedule.length === 0) {
        return <div className="p-4 text-center text-slate-500">No schedule generated.</div>;
    }

    return (
        <>
            <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[80px]">Month</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Installment</TableHead>
                            <TableHead>Penalty</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Paid Date</TableHead>
                            {canProcessPayment && <TableHead className="w-[100px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedule.map((item) => (
                            <TableRow key={item.month} className={item.status === 'PAID' ? 'bg-slate-50/50' : ''}>
                                <TableCell className="font-medium text-slate-700">#{item.month}</TableCell>
                                <TableCell>{format(new Date(item.due_date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="font-mono font-medium">{formatRupiah(item.amount)}</TableCell>
                                <TableCell className="text-red-500 text-xs">
                                    {item.penalty_paid > 0 ? formatRupiah(item.penalty_paid) : '-'}
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${item.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            item.status === 'OVERDUE' ? 'bg-red-100 text-red-700 border-red-200' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                            {getStatusIcon(item.status)}
                                            {getStatusBadge(item.status)}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell className="text-right text-slate-500 text-sm">
                                    {item.paid_at ? format(new Date(item.paid_at), 'dd MMM yyyy HH:mm') : '-'}
                                </TableCell>

                                {/* Payment Action Column */}
                                {canProcessPayment && (
                                    <TableCell>
                                        {item.status !== 'PAID' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs border-primary text-primary hover:bg-primary/10"
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