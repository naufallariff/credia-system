import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/shared/api/axios';
import { useClients } from '@/features/user/use-clients';
import { CreateContractSchema } from './create-contract-schema';
import { formatRupiah } from '@/entities/contract/model';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardFooter } from '@/shared/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { useToast } from "@/shared/hooks/use-toast";

export const CreateContractForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // 1. Fetch Clients for Dropdown
    const { data: clients, isLoading: loadingClients } = useClients();

    // 2. Form Setup
    const form = useForm({
        resolver: zodResolver(CreateContractSchema),
        defaultValues: {
            otr_price: 0,
            dp_amount: 0,
            interest_rate: 12, // Default 12%
            duration_month: 12, // Default 12 months
        }
    });

    // Watch values for live calculation
    const otr = form.watch('otr_price');
    const dp = form.watch('dp_amount');
    const principal = (otr || 0) - (dp || 0);

    // 3. API Mutation
    const mutation = useMutation({
        mutationFn: (data) => api.post('/contracts', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['contracts']);
            toast({ title: "Success", description: "Contract created successfully" });
            navigate('/contracts');
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to create contract"
            });
        }
    });

    const onSubmit = (data) => {
        // Inject calculated principal amount
        mutation.mutate({ ...data, principal_amount: principal });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: Client Info */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <h3 className="font-semibold text-slate-900 mb-4">Borrower Information</h3>

                        <div className="space-y-2">
                            <Label>Select Client</Label>
                            <Select onValueChange={(val) => form.setValue('client_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingClients ? "Loading..." : "Select a client"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients?.map(client => (
                                        <SelectItem key={client._id} value={client._id}>
                                            {client.name} ({client.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.client_id && (
                                <p className="text-xs text-red-500">{form.formState.errors.client_id.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Loan Details */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <h3 className="font-semibold text-slate-900 mb-4">Loan Simulation</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>OTR Price (Rp)</Label>
                                <Input type="number" {...form.register('otr_price')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Down Payment (Rp)</Label>
                                <Input type="number" {...form.register('dp_amount')} />
                            </div>
                        </div>
                        {/* Error Message for DP logic */}
                        {form.formState.errors.dp_amount && (
                            <p className="text-xs text-red-500">{form.formState.errors.dp_amount.message}</p>
                        )}

                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                            <span className="text-sm text-blue-700">Principal Amount</span>
                            <span className="font-bold text-blue-900">{formatRupiah(principal)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duration (Months)</Label>
                                <Select onValueChange={(v) => form.setValue('duration_month', parseInt(v))} defaultValue="12">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[6, 12, 18, 24, 36, 48].map(m => (
                                            <SelectItem key={m} value={m.toString()}>{m} Months</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Interest Rate (%/Year)</Label>
                                <Input type="number" step="0.1" {...form.register('interest_rate')} />
                            </div>
                        </div>

                    </CardContent>

                    <CardFooter className="bg-slate-50 border-t p-4 flex justify-end">
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Submit Application
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
};