import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/login-page';
import { ProtectedRoute } from '@/shared/lib/protected-route';

// Placeholder Components (Will be replaced in next phase)
const DashboardPage = () => <div className="p-10"><h1>Dashboard (Coming Soon)</h1></div>;
const ClientDashboardPage = () => <div className="p-10"><h1>Client Portal (Coming Soon)</h1></div>;

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- PUBLIC ROUTES --- */}
                <Route path="/auth/login" element={<LoginPage />} />

                {/* Redirect root to login for now */}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                {/* --- PROTECTED ROUTES (Admin & Staff) --- */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPERADMIN']}>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* --- PROTECTED ROUTES (Client) --- */}
                <Route
                    path="/client/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['CLIENT']}>
                            <ClientDashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};