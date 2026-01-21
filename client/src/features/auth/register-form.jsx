import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import api from '@/shared/api/axios';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/shared/hooks/use-toast';

// Schema Validation
const RegisterSchema = z.object({
    name: z.string().min(3, "Name is required"),
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 chars").regex(/^[a-zA-Z0-9.]+$/, "Alphanumeric only"),
    password: z.string().min(6, "Password must be at least 6 chars"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const RegisterForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(RegisterSchema)
    });

    const onSubmit = async (data) => {
        try {
            // Hardcode Role as CLIENT for public registration
            await api.post('/auth/register', {
                ...data,
                role: 'CLIENT'
            });

            toast({
                title: "Registration Successful",
                description: "Please sign in with your new account.",
            });

            navigate('/auth/login');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.response?.data?.message || "Something went wrong.",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...register('name')} placeholder="John Doe" className="bg-background" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register('email')} type="email" placeholder="john@example.com" className="bg-background" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Username</Label>
                <Input {...register('username')} placeholder="johndoe" className="bg-background" />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input {...register('password')} type="password" className="bg-background" />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input {...register('confirmPassword')} type="password" className="bg-background" />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
            </Button>
        </form>
    );
};