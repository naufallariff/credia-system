import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Settings2, Building2 } from 'lucide-react';

import { useConfig, useUpdateConfig } from '@/features/config/use-config';
import { LoanConfigSchema } from '@/entities/config/config-schema';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export const SettingsForm = () => {
    const { data: config, isLoading } = useConfig();
    const { mutate, isPending } = useUpdateConfig();

    const form = useForm({
        resolver: zodResolver(LoanConfigSchema),
        defaultValues: {
            interest_rate_default: 12,
            min_dp_percent: 20,
            penalty_fee_percent: 0.5,
            max_loan_duration: 60,
            company_name: '',
            company_address: ''
        }
    });

    // Populate form when data arrives
    useEffect(() => {
        if (config) {
            form.reset({
                interest_rate_default: config.interest_rate_default || 12,
                min_dp_percent: config.min_dp_percent || 20,
                penalty_fee_percent: config.penalty_fee_percent || 0.5,
                max_loan_duration: config.max_loan_duration || 60,
                company_name: config.company_name || 'Credia Finance',
                company_address: config.company_address || ''
            });
        }
    }, [config, form]);

    const onSubmit = (data) => {
        mutate(data);
    };

    if (isLoading) return <SettingsSkeleton />;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">

            {/* 1. Loan Business Rules */}
            <Card className="bg-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        <CardTitle>Loan Parameters</CardTitle>
                    </div>
                    <CardDescription>Define global default values for new contracts.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Default Interest Rate (% / Year)</Label>
                        <Input type="number" step="0.1" {...form.register('interest_rate_default')} />
                        <p className="text-xs text-muted-foreground">Base rate for new simulations.</p>
                        {form.formState.errors.interest_rate_default && <p className="text-xs text-destructive">{form.formState.errors.interest_rate_default.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Minimum Down Payment (%)</Label>
                        <Input type="number" step="1" {...form.register('min_dp_percent')} />
                        <p className="text-xs text-muted-foreground">Minimum required percentage of OTR.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Late Penalty Fee (% / Day)</Label>
                        <Input type="number" step="0.01" {...form.register('penalty_fee_percent')} />
                        <p className="text-xs text-muted-foreground">Daily fine calculation for overdue payments.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Max Loan Duration (Months)</Label>
                        <Input type="number" {...form.register('max_loan_duration')} />
                    </div>
                </CardContent>
            </Card>

            {/* 2. Company Information */}
            <Card className="bg-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle>Company Profile</CardTitle>
                    </div>
                    <CardDescription>Information displayed on printed contracts and invoices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input {...form.register('company_name')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Office Address</Label>
                        <Input {...form.register('company_address')} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Configuration
                </Button>
            </div>
        </form>
    );
};

const SettingsSkeleton = () => (
    <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
        <Skeleton className="h-[200px] w-full rounded-xl bg-muted" />
    </div>
);