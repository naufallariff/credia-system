import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import api from '@/shared/api/axios';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent } from '@/shared/ui/card';
import { useToast } from '@/shared/hooks/use-toast';

// Schema Validation
const RegisterSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .regex(/^[a-zA-Z0-9.]+$/, "Alphanumeric and dots only"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const RegisterForm = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(RegisterSchema)
    });

    const onSubmit = async (data) => {
        try {
            // Force role as CLIENT for public registration
            await api.post('/auth/register', {
                ...data,
                role: 'CLIENT'
            });

            toast({
                title: "Registration Successful",
                description: "Your account has been created. Please sign in.",
            });

            navigate('/auth/login');
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.response?.data?.message || "Could not create account.",
            });
        }
    };

    return (
        <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-emerald-500 animate-in fade-in zoom-in-95 duration-300 bg-card">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="John Doe"
                            className={`bg-background ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
                    </div>

                    {/* Email & Username Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="john@ex.com"
                                className={`bg-background ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                            {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                {...register('username')}
                                placeholder="johndoe"
                                className={`bg-background ${errors.username ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                            {errors.username && <p className="text-xs text-destructive font-medium">{errors.username.message}</p>}
                        </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                className={`bg-background ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                            {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword')}
                                className={`bg-background ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                            {errors.confirmPassword && <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    <Button type="submit" className="w-full font-bold mt-2" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Register Now'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};