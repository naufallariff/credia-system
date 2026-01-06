import { z } from 'zod';

export const LoanConfigSchema = z.object({
    interest_rate_default: z.coerce.number().min(0).max(100, "Rate must be between 0-100%"),
    min_dp_percent: z.coerce.number().min(0).max(100, "DP percentage must be between 0-100%"),
    penalty_fee_percent: z.coerce.number().min(0).max(100, "Penalty rate must be between 0-100%"),
    max_loan_duration: z.coerce.number().min(1, "Duration must be at least 1 month"),
    company_name: z.string().min(1, "Company name is required"),
    company_address: z.string().optional(),
});