import { User, CreditCard, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { formatRupiah } from '@/entities/contract/model';
import { format, isValid } from 'date-fns';

// Helper for safe date formatting to prevent crashes
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'dd MMMM yyyy') : '-';
};

const InfoRow = ({ label, value, isCurrency = false }) => (
    <div className="flex justify-between py-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-sm font-medium ${isCurrency ? 'font-mono text-foreground' : 'text-foreground'}`}>
            {value || '-'}
        </span>
    </div>
);

export const ContractInfo = ({ contract }) => {
    if (!contract) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Details */}
            <Card className="bg-card border-border h-fit">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" /> Financial Structure
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <InfoRow label="OTR Price" value={formatRupiah(contract.otr_price)} isCurrency />
                    <InfoRow label="Down Payment" value={formatRupiah(contract.dp_amount)} isCurrency />
                    <Separator className="my-2 bg-border" />
                    <InfoRow label="Principal Amount" value={formatRupiah(contract.principal_amount)} isCurrency />
                    <InfoRow label="Interest Rate" value={contract.interest_rate ? `${contract.interest_rate}% / Year` : '-'} />
                    <InfoRow label="Total Interest" value={formatRupiah(contract.total_loan - contract.principal_amount)} isCurrency />

                    {/* Highlight Box */}
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Installment</span>
                            <span className="text-lg font-bold text-primary">{formatRupiah(contract.monthly_installment)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Client & Metadata */}
            <Card className="bg-card border-border h-fit">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" /> Borrower Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <InfoRow label="Client Name" value={contract.client?.name} />
                    <InfoRow label="Client ID" value={contract.client?.custom_id} />
                    <InfoRow label="Email" value={contract.client?.email} />
                    <Separator className="my-4 bg-border" />
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-bold text-foreground">Contract Metadata</span>
                    </div>
                    {/* FIX: Use safe date formatter here */}
                    <InfoRow label="Created Date" value={formatDate(contract.created_at)} />
                    <InfoRow label="Duration" value={`${contract.duration_month} Months`} />
                    <InfoRow label="Status" value={contract.status} />
                </CardContent>
            </Card>
        </div>
    );
};