import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, Calculator, ArrowRight } from 'lucide-react';
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
import { Badge } from '@/shared/ui/badge';
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
            otr_price: 0,
            dp_amount: 0,
            interest_rate: 12, // Will be overridden by config
            duration_month: 12,
        },
        mode: "onChange" // Validate on change for better UX
    });

    // 3. Apply Global Config Defaults
    useEffect(() => {
        if (config) {
            if (!form.getValues('interest_rate')) {
                form.setValue('interest_rate', config.interest_rate_default || 12);
            }
        }
    }, [config, form]);

    // 4. Real-time Calculation Engine (The "Brain")
    const formValues = form.watch();

    const simulation = useMemo(() => {
        const otr = Number(formValues.otr_price) || 0;
        const dp = Number(formValues.dp_amount) || 0;
        const rate = Number(formValues.interest_rate) || 0;
        const duration = Number(formValues.duration_month) || 12;

        const principal = Math.max(0, otr - dp);

        // Flat Rate Calculation Logic
        const totalInterest = Math.ceil(principal * (rate / 100) * (duration / 12));
        const totalLoan = principal + totalInterest;
        const monthlyInstallment = duration > 0 ? Math.ceil(totalLoan / duration) : 0;

        return {
            principal,
            totalInterest,
            totalLoan,
            monthlyInstallment
        };
    }, [formValues.otr_price, formValues.dp_amount, formValues.interest_rate, formValues.duration_month]);

    // 5. API Mutation
    const mutation = useMutation({
        mutationFn: (data) => api.post('/contracts', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['contracts']);
            toast({ title: "Application Submitted", description: "Contract has been created and is pending approval." });
            navigate('/contracts');
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: error.response?.data?.message || "Failed to create contract"
            });
        }
    });

    const onSubmit = (data) => {
        // Inject calculated principal for backend validation safety
        mutation.mutate({ ...data, principal_amount: simulation.principal });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- LEFT COLUMN: INPUTS (2/3 Width) --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Section 1: Borrower Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Borrower Information</CardTitle>
                            <CardDescription>Select the client applying for financing.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>Select Client</Label>
                                <Select onValueChange={(val) => form.setValue('client_id', val)}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients?.map(client => (
                                            <SelectItem key={client._id} value={client._id}>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium">{client.name}</span>
                                                    <span className="text-xs text-slate-500">{client.email}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.client_id && (
                                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.client_id.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Loan Parameters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Loan Parameters</CardTitle>
                            <CardDescription>Define the asset value and financing terms.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* OTR Input with Helper */}
                                <div className="space-y-2">
                                    <Label>OTR Price (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 25000000"
                                        className="font-mono"
                                        {...form.register('otr_price')}
                                    />
                                    {formValues.otr_price > 0 && (
                                        <p className="text-xs text-slate-500 text-right">
                                            {formatRupiah(formValues.otr_price)}
                                        </p>
                                    )}
                                </div>

                                {/* DP Input with Helper */}
                                <div className="space-y-2">
                                    <Label>Down Payment (Rp)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Min 20%"
                                        className="font-mono"
                                        {...form.register('dp_amount')}
                                    />
                                    {formValues.dp_amount > 0 && (
                                        <p className="text-xs text-slate-500 text-right">
                                            {formatRupiah(formValues.dp_amount)}
                                        </p>
                                    )}
                                    {form.formState.errors.dp_amount && (
                                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.dp_amount.message}</p>
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
                                        <SelectTrigger>
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
                                    <Label>Interest Rate (% / Year)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            className="pr-8"
                                            {...form.register('interest_rate')}
                                        />
                                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- RIGHT COLUMN: SIMULATION SUMMARY (1/3 Width) --- */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-primary/20 shadow-lg shadow-primary/5">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b">
                            <div className="flex items-center gap-2 text-primary">
                                <Calculator className="h-5 w-5" />
                                <CardTitle className="text-lg">Loan Simulation</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">

                            {/* Principal Calculation */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Asset Price (OTR)</span>
                                    <span>{formatRupiah(formValues.otr_price || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Down Payment (-)</span>
                                    <span>{formatRupiah(formValues.dp_amount || 0)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-medium text-slate-900">
                                    <span>Principal Amount</span>
                                    <span>{formatRupiah(simulation.principal)}</span>
                                </div>
                            </div>

                            {/* Interest Calculation */}
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm space-y-2">
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Interest</span>
                                    <span>{formatRupiah(simulation.totalInterest)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Loan</span>
                                    <span>{formatRupiah(simulation.totalLoan)}</span>
                                </div>
                            </div>

                            {/* The Golden Number: Monthly Installment */}
                            <div className="pt-4 text-center">
                                <p className="text-sm text-slate-500 mb-1">Estimated Monthly Payment</p>
                                <div className="text-3xl font-bold text-primary tracking-tight">
                                    {formatRupiah(simulation.monthlyInstallment)}
                                </div>
                                <Badge variant="outline" className="mt-2 font-normal text-slate-500">
                                    for {formValues.duration_month || 12} months
                                </Badge>
                            </div>

                        </CardContent>
                        <CardFooter className="pt-2 pb-6 px-6">
                            <Button type="submit" className="w-full h-11 text-base shadow-md" disabled={mutation.isPending}>
                                {mutation.isPending ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center">
                                        Submit Application <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </form>
    );
};