import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { ProtectedRoute } from '@/shared/lib/protected-route';
import { DashboardLayout } from '@/widgets/layout/dashboard-layout';

// --- LAZY IMPORTS (Optimasi Performa) ---
// Menggunakan teknik Named Export: .then(module => ({ default: module.ComponentName }))
const LoginPage = lazy(() => import('@/pages/auth/login-page').then(m => ({ default: m.LoginPage })));

// Core Modules
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard-page').then(m => ({ default: m.DashboardPage })));
const ContractListPage = lazy(() => import('@/pages/contract/contract-list-page').then(m => ({ default: m.ContractListPage })));
const CreateContractPage = lazy(() => import('@/pages/contract/create-contract-page').then(m => ({ default: m.CreateContractPage })));
const ContractDetailPage = lazy(() => import('@/pages/contract/contract-detail-page').then(m => ({ default: m.ContractDetailPage })));

// Admin Modules
const ApprovalPage = lazy(() => import('@/pages/approval/approval-page').then(m => ({ default: m.ApprovalPage })));
const UserListPage = lazy(() => import('@/pages/user/user-list-page').then(m => ({ default: m.UserListPage })));
const SettingsPage = lazy(() => import('@/pages/config/settings-page').then(m => ({ default: m.SettingsPage })));

// Client Module
const ClientDashboardPage = lazy(() => import('@/pages/client/client-dashboard-page').then(m => ({ default: m.ClientDashboardPage })));

// --- LOADING FALLBACK COMPONENT ---
const PageLoader = () => (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background text-muted-foreground gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading Application...</p>
    </div>
);
export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/auth/login" element={<LoginPage />} />

                    {/* Protected Layout Routes */}
                    <Route element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPERADMIN', 'CLIENT']}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        {/* Default Redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* Shared Dashboard */}
                        <Route path="/dashboard" element={<DashboardPage />} />

                        {/* Contract Module */}
                        <Route path="/contracts" element={<ContractListPage />} />
                        <Route path="/contracts/new" element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPERADMIN']}>
                                <CreateContractPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/contracts/:id" element={<ContractDetailPage />} />

                        {/* --- ADMIN ONLY ROUTES --- */}
                        <Route path="/approvals" element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                                <ApprovalPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/users" element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                                <UserListPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/config" element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                                <SettingsPage />
                            </ProtectedRoute>
                        } />

                        {/* --- CLIENT ONLY ROUTES --- */}
                        <Route path="/client/dashboard" element={
                            <ProtectedRoute allowedRoles={['CLIENT']}>
                                <ClientDashboardPage />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Catch All - Redirect to Login */}
                    <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};