import { format } from 'date-fns';
import { Calendar, CreditCard, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { formatRupiah } from '@/entities/contract/model';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

export const ActiveLoanCard = ({ contract, summary }) => {
    const navigate = useNavigate();

    if (!contract) {
        return (
            <Card className="bg-muted/30 border-dashed border-2 border-border shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <CreditCard className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-semibold text-foreground">No Active Loan</h3>
                    <p className="text-sm text-muted-foreground mb-4">You don't have any active financing at the moment.</p>
                    <Button onClick={() => navigate('/contracts/new')}>Apply for Loan</Button>
                </CardContent>
            </Card>
        );
    }

    // Calculate Progress %
    const totalAmount = contract.total_loan;
    const paidAmount = totalAmount - summary.remainingDebt;
    const progress = Math.round((paidAmount / totalAmount) * 100);

    return (
        <Card className="border-l-4 border-l-primary shadow-md overflow-hidden relative bg-card border-t border-r border-b border-border">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <CreditCard className="h-32 w-32 text-primary" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                            Active Contract
                        </Badge>
                        <CardTitle className="text-xl font-bold text-foreground">
                            {contract.contract_no}
                        </CardTitle>
                        <CardDescription>
                            Vehicle Financing • {contract.duration_month} Months
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Installment</p>
                        <p className="text-xl font-bold text-foreground">
                            {formatRupiah(contract.monthly_installment)}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Repayment Progress</span>
                        <span className="text-foreground font-bold">{progress}% Paid</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-muted" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatRupiah(paidAmount)}</span>
                        <span>Total: {formatRupiah(totalAmount)}</span>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase">Remaining Debt</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                            {formatRupiah(summary.remainingDebt)}
                        </p>
                    </div>

                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase">Next Due Date</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                            {summary.nextDueDate
                                ? format(new Date(summary.nextDueDate), 'dd MMM yyyy')
                                : 'All Paid'}
                        </p>
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={() => navigate(`/contracts/${contract._id}`)}
                >
                    View Full Details & Payment History
                </Button>
            </CardContent>
        </Card>
    );
};