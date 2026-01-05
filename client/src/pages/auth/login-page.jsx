import { LoginForm } from '@/features/auth/login-form';

export const LoginPage = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-primary/10 -skew-y-6 transform origin-top-left z-0" />

            {/* Login Widget */}
            <div className="relative z-10 w-full px-4 flex justify-center">
                <LoginForm />
            </div>
        </div>
    );
};