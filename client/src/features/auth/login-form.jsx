import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

import api from '@/shared/api/axios';
import { useSession } from '@/shared/model/use-session';
import { LoginSchema } from '@/entities/user/model';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/shared/ui/card';

export const LoginForm = () => {
    const navigate = useNavigate();
    const { setSession } = useSession();
    const [globalError, setGlobalError] = useState('');

    // Form Initialization with Zod Validation
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(LoginSchema),
    });

    // Handler: Submit Logic
    const onSubmit = async (data) => {
        setGlobalError('');
        try {
            // Execute API Call
            const response = await api.post('/auth/login', {
                identifier: data.identifier,
                password: data.password,
            });

            const { user, token } = response.data.data;

            // Update Global State
            setSession(user, token);
            localStorage.setItem('token', token); // Sync for Axios Interceptor

            // Redirect based on Role (Smart Routing)
            if (user.role === 'CLIENT') {
                navigate('/client/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            // Secure Error Handling
            const msg = error.response?.data?.message || 'Authentication failed. Please try again.';
            setGlobalError(msg);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in-95 duration-300 bg-white relative">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-primary">Credia Enterprise</CardTitle>
                <CardDescription>Secure Access Portal</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Global Error Feedback */}
                    {globalError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{globalError}</AlertDescription>
                        </Alert>
                    )}

                    {/* Identifier Field */}
                    <div className="space-y-2">
                        <Label htmlFor="identifier">Username or Email</Label>
                        <Input
                            id="identifier"
                            placeholder="admin@credia.com"
                            disabled={isSubmitting}
                            {...register('identifier')}
                            className={errors.identifier ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.identifier && (
                            <p className="text-xs text-red-500 font-medium">{errors.identifier.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            disabled={isSubmitting}
                            {...register('password')}
                            className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="text-center text-xs text-muted-foreground">
                <p>Protected by reCAPTCHA and Credia Security Protocols.</p>
            </CardFooter>
        </Card>
    );
};