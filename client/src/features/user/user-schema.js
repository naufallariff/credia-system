import { z } from 'zod';

export const CreateUserSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    username: z.string().min(3, "Username is required").regex(/^[a-z0-9.]+$/, "Lowercase, numbers, dots only"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password min 6 characters"),
    role: z.enum(['ADMIN', 'STAFF', 'CLIENT']),
});