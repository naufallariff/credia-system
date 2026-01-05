import { User, CreditCard, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { formatRupiah } from '@/entities/contract/model';
import { format } from 'date-fns';

const InfoRow = ({ label, value, isCurrency = false }) => (
    <div className="flex justify-between py-2">
        <span className="text-sm text-slate-500">{label}</span>
        <span className={`text-sm font-medium ${isCurrency ? 'font-mono text-slate-900' : 'text-slate-700'}`}>
            {value}
        </span>
    </div>
);

export const ContractInfo = ({ contract }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Details */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Financial Structure
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <InfoRow label="OTR Price" value={formatRupiah(contract.otr_price)} isCurrency />
                    <InfoRow label="Down Payment" value={formatRupiah(contract.dp_amount)} isCurrency />
                    <Separator className="my-2" />
                    <InfoRow label="Principal Amount" value={formatRupiah(contract.principal_amount)} isCurrency />
                    <InfoRow label="Interest Rate" value={`${contract.interest_rate}% / Year`} />
                    <InfoRow label="Total Interest" value={formatRupiah(contract.total_loan - contract.principal_amount)} isCurrency />
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Installment</span>
                            <span className="text-lg font-bold text-primary">{formatRupiah(contract.monthly_installment)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Client & Metadata */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <User className="h-4 w-4" /> Borrower Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <InfoRow label="Client Name" value={contract.client?.name} />
                    <InfoRow label="Client ID" value={contract.client?.custom_id} />
                    <InfoRow label="Email" value={contract.client?.email || '-'} />
                    <Separator className="my-4" />
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">Contract Metadata</span>
                    </div>
                    <InfoRow label="Created Date" value={format(new Date(contract.created_at), 'dd MMMM yyyy')} />
                    <InfoRow label="Duration" value={`${contract.duration_month} Months`} />
                    <InfoRow label="Status" value={contract.status} />
                </CardContent>
            </Card>
        </div>
    );
};