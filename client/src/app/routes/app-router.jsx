import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/login-page';
import { ProtectedRoute } from '@/shared/lib/protected-route';
import { DashboardLayout } from '@/widgets/layout/dashboard-layout';

// Placeholder Components (Will be replaced in next phase)
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
const ClientDashboardPage = () => <div className="p-10"><h1>Client Portal (Coming Soon)</h1></div>;
import { ContractListPage } from '@/pages/contract/contract-list-page';
import { CreateContractPage } from '@/pages/contract/create-contract-page';
import { ContractDetailPage } from '@/pages/contract/contract-detail-page';

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
                    <Route path="/contracts" element={<ContractListPage />} />
                    <Route path="/contracts/new" element={<CreateContractPage />} />
                    <Route path="/contracts/:id" element={<ContractDetailPage />} />
                    {/* Tambahkan rute lain sesuai kebutuhan */}
                </Route>

                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};