import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/shared/model/use-session';
import { Loader2 } from 'lucide-react';

// Tambahkan prop 'children' disini
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, isAuthenticated, isLoading } = useSession();
    const location = useLocation();

    // 1. Loading State
    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 2. Authentication Check
    if (!isAuthenticated || !user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // 3. Authorization Check (RBAC)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        if (user.role === 'CLIENT') {
            return <Navigate to="/client/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Access Granted (FIXED)
    // Jika ada children (seperti ApprovalPage), render children.
    // Jika tidak (seperti pembungkus Layout), render Outlet.
    return children ? children : <Outlet />;
};