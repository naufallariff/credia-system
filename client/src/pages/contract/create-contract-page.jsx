import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CreateContractForm } from '@/features/contract/create-contract-form';
import { Button } from '@/shared/ui/button';

export const CreateContractPage = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/contracts')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">New Loan Application</h1>
                    <p className="text-slate-500 text-sm">Fill in the details below to initiate a new financing contract.</p>
                </div>
            </div>

            <CreateContractForm />
        </div>
    );
};