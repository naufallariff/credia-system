import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// --- AUTHENTICATION MODULE ---
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChangeInitialPassword from './pages/auth/ChangeInitialPassword';

// --- OPERATIONAL MODULE (Staff) ---
import CreateContract from './pages/staff/CreateContract';
import ContractList from './pages/staff/ContractList';
import ContractDetail from './pages/shared/ContractDetail';

// --- ADMIN MODULE ---
import ApprovalList from './pages/admin/ApprovalList';
import UserManagement from './pages/admin/UserManagement';
import GlobalConfig from './pages/admin/GlobalConfig';

// --- DASHBOARD & SHARED ---
import Dashboard from './pages/shared/Dashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import NotFound from './pages/shared/NotFound';

/**
 * DashboardDispatcher
 * Dynamically renders the correct home view based on the user's role.
 */
const DashboardDispatcher = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'CLIENT') {
    return <ClientDashboard />;
  }

  // Enterprise Dashboard for Admin, Superadmin, and Staff
  if (['ADMIN', 'SUPERADMIN', 'STAFF'].includes(user.role)) {
    return <Dashboard />;
  }

  return <div className="p-8 text-center text-slate-500">Initializing Workspace...</div>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 2. ONBOARDING (Semi-Protected) */}
        <Route path="/auth/change-initial-password" element={<ChangeInitialPassword />} />

        {/* 3. CORE APP (Protected + Layout) */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardDispatcher />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* 4. STAFF OPERATIONS */}
        <Route path="/contracts" element={
          <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'SUPERADMIN']}>
            <MainLayout>
              <ContractList />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/contracts/new" element={
          <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'SUPERADMIN']}>
            <MainLayout>
              <CreateContract />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* 5. SHARED DETAILS */}
        <Route path="/contracts/:id" element={
          <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'SUPERADMIN', 'CLIENT']}>
            <MainLayout>
              <ContractDetail />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* 6. CLIENT SPECIFIC */}
        <Route path="/my-loans" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <MainLayout>
              <ClientDashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* 7. ADMIN GOVERNANCE */}
        <Route path="/approvals" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <MainLayout>
              <ApprovalList />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <MainLayout>
              <UserManagement />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/config" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <MainLayout>
              <GlobalConfig />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* 8. ERROR HANDLING */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;