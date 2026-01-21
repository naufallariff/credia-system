import { z } from 'zod';

export const CreateUserSchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name is too long"),
    username: z.string()
        .min(3, "Username is required")
        .regex(/^[a-z0-9.]+$/, "Lowercase letters, numbers, and dots only"),
    email: z.string()
        .email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters"),
    role: z.enum(['ADMIN', 'STAFF', 'CLIENT'], {
        errorMap: () => ({ message: "Please select a valid role" })
    }),
});