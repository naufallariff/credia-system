import { PDFDownloadLink } from '@react-pdf/renderer';
import { Printer, Loader2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { ContractDocument } from '@/entities/document/contract-pdf';
import { useConfig } from '@/features/config/use-config';

export const PrintContractButton = ({ contract }) => {
    const { data: config } = useConfig();
    const companyName = config?.company_name || 'Credia Multi Finance';

    const fileName = `Contract_${contract.contract_no || 'DRAFT'}_${contract.client?.name?.replace(/\s+/g, '_')}.pdf`;

    return (
        <PDFDownloadLink
            document={<ContractDocument contract={contract} companyName={companyName} />}
            fileName={fileName}
        >
            {({ loading }) => (
                <Button
                    variant="outline"
                    className="gap-2 bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground shadow-sm"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Printer className="h-4 w-4" />
                    )}
                    {loading ? 'Preparing PDF...' : 'Print Contract'}
                </Button>
            )}
        </PDFDownloadLink>
    );
};