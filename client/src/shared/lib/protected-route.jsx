import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/shared/model/use-session';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, isAuthenticated, isLoading } = useSession();
    const location = useLocation();

    // 1. Loading State: Prevent premature redirect
    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 2. Authentication Check
    if (!isAuthenticated || !user) {
        // Redirect to login, saving the attempted location for better UX
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // 3. Authorization Check (RBAC)
    // If allowedRoles is empty, we assume the route is open to any authenticated user.
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect logic based on role to prevent "stuck" navigation
        if (user.role === 'CLIENT') {
            return <Navigate to="/client/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Access Granted
    return <Outlet />;
};