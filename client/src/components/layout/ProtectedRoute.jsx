import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    // 1. Check Authentication
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check Role Access (RBAC)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // If user is logged in but doesn't have permission, redirect to dashboard
        return <Navigate to="/" replace />;
    }

    // 3. Grant Access
    return children;
};

export default ProtectedRoute;