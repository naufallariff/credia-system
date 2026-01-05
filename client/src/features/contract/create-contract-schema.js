import { z } from 'zod';

export const CreateContractSchema = z.object({
    client_id: z.string().min(1, "Client is required"),
    otr_price: z.coerce.number().min(1000000, "Minimum OTR is 1 Million"),
    dp_amount: z.coerce.number().min(0, "DP cannot be negative"),
    duration_month: z.coerce.number().min(3, "Min duration 3 months"),
    interest_rate: z.coerce.number().min(0).max(100, "Rate 0-100%"),
}).refine((data) => data.dp_amount < data.otr_price, {
    message: "DP must be less than OTR Price",
    path: ["dp_amount"],
});