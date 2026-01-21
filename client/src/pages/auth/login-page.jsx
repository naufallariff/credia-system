import { Link } from 'react-router-dom'; // 1. Import Link
import { LoginForm } from '@/features/auth/login-form';
import { CreditCard, ShieldCheck, TrendingUp } from 'lucide-react';

export const LoginPage = () => {
    return (
        <div className="min-h-screen w-full flex bg-background">

            {/* Left Section: Login Form (40% width on large screens) */}
            <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-8 lg:p-12 border-r border-border relative">
                <div className="w-full max-w-md space-y-8">
                    {/* Brand Header for Mobile/Tablet */}
                    <div className="flex items-center gap-2 lg:hidden mb-8">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">C</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">CrediaSys</span>
                    </div>

                    <div className="text-center lg:text-left">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Enter your credentials to access your workspace.
                        </p>
                    </div>

                    {/* The Actual Form */}
                    <LoginForm />

                    {/* 2. Registration Link Section (NEW) */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>
                            Don&apos;t have an account?{' '}
                            <Link
                                to="/auth/register"
                                className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 text-center text-xs text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} Credia Financial Systems. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Section: Banner / Visuals (60% width) */}
            <div className="hidden lg:flex w-[60%] bg-muted/30 relative overflow-hidden flex-col items-center justify-center p-12 text-center">
                {/* Abstract Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-lg space-y-8">
                    {/* Floating Cards Illustration */}
                    <div className="relative h-64 w-full flex justify-center items-center mb-12">
                        {/* Card 1 */}
                        <div className="absolute transform -rotate-6 translate-x-[-40px] bg-card border border-border p-4 rounded-xl shadow-lg w-48 h-32 flex flex-col justify-between">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="space-y-1">
                                <div className="h-2 w-16 bg-muted rounded" />
                                <div className="h-2 w-24 bg-muted rounded" />
                            </div>
                        </div>
                        {/* Card 2 (Center) */}
                        <div className="absolute transform rotate-0 z-10 bg-card border border-border p-5 rounded-xl shadow-xl w-56 h-36 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CreditCard size={20} />
                                </div>
                                <div className="h-2 w-12 bg-muted rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-muted-foreground/20 rounded" />
                                <div className="h-2 w-32 bg-muted rounded" />
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="absolute transform rotate-12 translate-x-[40px] bg-card border border-border p-4 rounded-xl shadow-lg w-48 h-32 flex flex-col justify-between z-0 opacity-80">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <TrendingUp size={18} />
                            </div>
                            <div className="space-y-1">
                                <div className="h-2 w-16 bg-muted rounded" />
                                <div className="h-2 w-24 bg-muted rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Secure & Efficient Financing
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Manage contracts, track payments, and analyze portfolio performance with our enterprise-grade lending platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};