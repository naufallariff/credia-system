import { z } from 'zod';

// Schema for Contract Data
export const ContractSchema = z.object({
    _id: z.string(),
    contract_no: z.string().nullable(),
    client: z.object({
        _id: z.string(),
        name: z.string(),
        custom_id: z.string().optional(),
    }),
    otr_price: z.number(),
    dp_amount: z.number(),
    principal_amount: z.number(),
    interest_rate: z.number(),
    duration_month: z.number(),
    monthly_installment: z.number(),
    total_loan: z.number(),
    remaining_loan: z.number(),
    status: z.enum(['PENDING_ACTIVATION', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'VOID']),
    created_at: z.string(),
});

// Helper for formatting Currency (IDR)
export const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};