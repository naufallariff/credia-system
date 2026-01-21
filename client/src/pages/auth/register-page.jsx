import { Link } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/register-form';

export const RegisterPage = () => {
    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Left: Branding & Info */}
            <div className="hidden lg:flex w-[40%] bg-primary/5 flex-col justify-between p-12 border-r border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">C</div>
                    <span className="text-xl font-bold text-foreground">CrediaSys</span>
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-foreground">Start your financing journey today.</h2>
                    <p className="text-lg text-muted-foreground">Create an account to manage your loans, view payment schedules, and apply for new financing securely.</p>
                </div>
                <p className="text-xs text-muted-foreground">© 2024 Credia Financial Systems</p>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-[60%] flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
                        <p className="text-sm text-muted-foreground">Enter your details to get started.</p>
                    </div>

                    <RegisterForm />

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};