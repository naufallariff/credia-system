import { useState, useEffect } from 'react';
import { Loader2, DollarSign } from 'lucide-react';
import { useMakePayment } from '@/features/payment/use-make-payment';
import { formatRupiah } from '@/entities/contract/model';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export const PaymentModal = ({ contractId, installment, isOpen, onClose, remainingLoan }) => {
    const { mutate, isPending } = useMakePayment();
    const [amount, setAmount] = useState(0);

    // Set default amount when installment changes
    useEffect(() => {
        if (installment) {
            // Suggest full payment (Installment + Penalty)
            setAmount(installment.amount + (installment.penalty_paid || 0));
        }
    }, [installment]);

    const maxPayment = remainingLoan || installment?.amount * 2;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!installment) return;

        mutate({
            contractId,
            month: installment.month,
            amount: parseFloat(amount)
        }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    if (!installment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Process installment payment for Month #{installment.month}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="p-4 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Installment Due</span>
                            <span className="font-medium">{formatRupiah(installment.amount)}</span>
                        </div>
                        {installment.penalty_paid > 0 && (
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Penalty</span>
                                <span>+ {formatRupiah(installment.penalty_paid)}</span>
                            </div>
                        )}
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                            <span>Total Bill</span>
                            <span>{formatRupiah(installment.amount + (installment.penalty_paid || 0))}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Payment Amount (Rp)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-9"
                                required
                                min={1}
                                max={maxPayment}
                            />
                        </div>
                        {/* Feedback Visual Error */}
                        {parseFloat(amount) > maxPayment ? (
                            <p className="text-xs text-red-500 font-medium">
                                Amount exceeds remaining loan balance ({formatRupiah(maxPayment)}).
                            </p>
                        ) : (
                            <p className="text-xs text-slate-500">
                                Max payment allowed: {formatRupiah(maxPayment)}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        {/* Disable tombol jika amount invalid */}
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || parseFloat(amount) > maxPayment}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};