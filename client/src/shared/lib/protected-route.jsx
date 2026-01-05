import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/shared/model/use-session';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated } = useSession();
    const location = useLocation();

    // 1. Check Authentication
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // 2. Check Role Access (RBAC)
    // If allowedRoles is empty, it means accessible by any authenticated user
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Unauthorized access redirects to dashboard default
        return <Navigate to="/" replace />;
    }

    return children;
};