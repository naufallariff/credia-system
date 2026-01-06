import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/login-page';
import { ProtectedRoute } from '@/shared/lib/protected-route';
import { DashboardLayout } from '@/widgets/layout/dashboard-layout';

// Placeholder Components (Will be replaced in next phase)
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { ContractListPage } from '@/pages/contract/contract-list-page';
import { CreateContractPage } from '@/pages/contract/create-contract-page';
import { ContractDetailPage } from '@/pages/contract/contract-detail-page';
import { ApprovalPage } from '@/pages/approval/approval-page';
import { UserListPage } from '@/pages/user/user-list-page';
import { ClientDashboardPage } from '@/pages/client/client-dashboard-page';

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

                {/* --- CLIENT DASHBOARD PAGE (CLIENT ONLY) --- */}
                <Route
                    path="/client/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['CLIENT']}>
                            <ClientDashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* --- APPROVAL PAGE (ADMIN/SUPERADMIN ONLY) --- */}
                <Route
                    path="/approvals"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                            <ApprovalPage />
                        </ProtectedRoute>
                    }
                />

                {/* --- USER MANAGEMENT PAGE (ADMIN/SUPERADMIN ONLY) --- */}
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                            <UserListPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};