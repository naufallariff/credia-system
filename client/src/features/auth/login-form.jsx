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

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = async (data) => {
        setGlobalError('');
        try {
            const response = await api.post('/auth/login', {
                identifier: data.identifier,
                password: data.password,
            });

            const { user, token } = response.data.data;

            setSession(user, token);
            localStorage.setItem('token', token);

            if (user.role === 'CLIENT') {
                navigate('/client/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Authentication failed. Please try again.';
            setGlobalError(msg);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in-95 duration-300 bg-card">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-primary">Credia Enterprise</CardTitle>
                <CardDescription className="text-muted-foreground">Secure Access Portal</CardDescription>
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
                            className={`bg-background ${errors.identifier ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {errors.identifier && (
                            <p className="text-xs text-destructive font-medium">{errors.identifier.message}</p>
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
                            className={`bg-background ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
                        )}
                    </div>

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

            <CardFooter className="text-center text-xs text-muted-foreground flex justify-center">
                <p>Protected by reCAPTCHA and Credia Security Protocols.</p>
            </CardFooter>
        </Card>
    );
};