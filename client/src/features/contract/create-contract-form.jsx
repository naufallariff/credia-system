import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, Calculator, ArrowRight, Lock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/shared/api/axios';
import { useClients } from '@/features/user/use-clients';
import { useConfig } from '@/features/config/use-config';
import { CreateContractSchema } from './create-contract-schema';
import { formatRupiah } from '@/entities/contract/model';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
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

    // 1. Fetch Dependencies
    const { data: clients, isLoading: loadingClients } = useClients();
    const { data: config } = useConfig();

    // 2. Form Setup
    const form = useForm({
        resolver: zodResolver(CreateContractSchema),
        defaultValues: {
            otr_price: '',
            dp_amount: '',
            interest_rate: 0,
            duration_month: 12,
        },
        mode: "onChange"
    });

    const otrPrice = form.watch('otr_price');

    // 3. AUTO-LOGIC
    useEffect(() => {
        if (config) {
            form.setValue('interest_rate', config.interest_rate_default || 12, { shouldValidate: true });
            if (otrPrice && otrPrice > 0) {
                const minDpPercent = config.min_dp_percent || 20;
                const autoDp = Math.ceil(otrPrice * (minDpPercent / 100));
                const currentDp = form.getValues('dp_amount');
                if (!currentDp || currentDp < autoDp) {
                    form.setValue('dp_amount', autoDp, { shouldValidate: true });
                }
            }
        }
    }, [config, otrPrice, form]);

    // 4. Calculation
    const formValues = form.watch();
    const simulation = useMemo(() => {
        const otr = Number(formValues.otr_price) || 0;
        const dp = Number(formValues.dp_amount) || 0;
        const rate = Number(formValues.interest_rate) || 0;
        const duration = Number(formValues.duration_month) || 12;

        const principal = Math.max(0, otr - dp);
        const totalInterest = Math.ceil(principal * (rate / 100) * (duration / 12));
        const totalLoan = principal + totalInterest;
        const monthlyInstallment = duration > 0 ? Math.ceil(totalLoan / duration) : 0;

        return { principal, totalInterest, totalLoan, monthlyInstallment };
    }, [formValues]);

    // 5. Mutation
    const mutation = useMutation({
        mutationFn: (data) => api.post('/contracts', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['contracts']);
            toast({ title: "Success", description: "Contract submitted for approval." });
            navigate('/contracts');
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.response?.data?.message || "Verify your inputs."
            });
        }
    });

    const onSubmit = (data) => {
        mutation.mutate({ ...data, principal_amount: simulation.principal });
    };

    const minDpPercent = config?.min_dp_percent || 20;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- LEFT COLUMN: INPUTS --- */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Borrower Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>Select Client</Label>
                                <Select onValueChange={(val) => form.setValue('client_id', val)}>
                                    <SelectTrigger className="h-11 bg-background">
                                        <SelectValue placeholder={loadingClients ? "Loading..." : "Select a client..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients?.map(client => (
                                            <SelectItem key={client._id} value={client._id}>
                                                {client.name} - {client.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.client_id && (
                                    <p className="text-xs text-destructive">{form.formState.errors.client_id.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Loan Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>OTR Price (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 50000000"
                                        {...form.register('otr_price')}
                                    />
                                    {formValues.otr_price > 0 && (
                                        <p className="text-xs text-muted-foreground text-right">
                                            {formatRupiah(formValues.otr_price)}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Down Payment (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder={`Min ${minDpPercent}% of OTR`}
                                        {...form.register('dp_amount')}
                                    />
                                    {formValues.dp_amount > 0 && (
                                        <p className="text-xs text-muted-foreground text-right">
                                            {formatRupiah(formValues.dp_amount)}
                                        </p>
                                    )}
                                    {form.formState.errors.dp_amount && (
                                        <p className="text-xs text-destructive">{form.formState.errors.dp_amount.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Duration</Label>
                                    <Select
                                        onValueChange={(v) => form.setValue('duration_month', parseInt(v))}
                                        defaultValue="12"
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[6, 12, 18, 24, 36, 48, 60].map(m => (
                                                <SelectItem key={m} value={m.toString()}>{m} Months</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Interest Rate (%/Year)
                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                    </Label>
                                    {/* FIX: Ganti class hardcoded bg-slate-100 menjadi bg-muted */}
                                    <Input
                                        type="number"
                                        readOnly
                                        className="bg-muted text-muted-foreground cursor-not-allowed opacity-100 border-border"
                                        {...form.register('interest_rate')}
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Rate is locked by Global Configuration.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- RIGHT COLUMN: SIMULATION --- */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-primary/20 bg-primary/5">
                        <CardHeader className="border-b border-primary/10 pb-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Calculator className="h-5 w-5" />
                                <CardTitle className="text-lg">Simulation</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Asset Price</span>
                                    <span>{formatRupiah(formValues.otr_price || 0)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Down Payment</span>
                                    <span>- {formatRupiah(formValues.dp_amount || 0)}</span>
                                </div>
                                <Separator className="my-2 bg-primary/20" />
                                <div className="flex justify-between font-bold text-foreground">
                                    <span>Principal</span>
                                    <span>{formatRupiah(simulation.principal)}</span>
                                </div>
                            </div>

                            <div className="pt-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Monthly Installment</p>
                                <div className="text-3xl font-bold text-primary tracking-tight">
                                    {formatRupiah(simulation.monthlyInstallment)}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 pb-6 px-6">
                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Submit Application"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </form>
    );
};