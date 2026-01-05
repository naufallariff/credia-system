import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/login-page';
import { ProtectedRoute } from '@/shared/lib/protected-route';
import { DashboardLayout } from '@/widgets/layout/dashboard-layout';

// Placeholder Components (Will be replaced in next phase)
const DashboardPage = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 h-96"><h1>Dashboard Statistics Loading...</h1></div>;
const ClientDashboardPage = () => <div className="p-10"><h1>Client Portal (Coming Soon)</h1></div>;


export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                {/* --- PROTECTED AREA WITH LAYOUT --- */}
                <Route element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPERADMIN', 'CLIENT']}>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    {/* Child Routes akan dirender di dalam <Outlet /> milik DashboardLayout */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/contracts" element={<div>Contract List Page</div>} />
                    <Route path="/contracts/new" element={<div>Create Contract Page</div>} />
                    {/* Tambahkan rute lain sesuai kebutuhan */}
                </Route>

                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};