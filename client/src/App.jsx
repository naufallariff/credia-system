import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChangeInitialPassword from './pages/auth/ChangeInitialPassword';

// Operational Pages
import CreateContract from './pages/staff/CreateContract';
import ContractList from './pages/staff/ContractList';

// Shared Pages
import ContractDetail from './pages/shared/ContractDetail';
import Dashboard from './pages/shared/Dashboard';
import NotFound from './pages/shared/NotFound';

// Admin Pages
import ApprovalList from './pages/admin/ApprovalList';
import UserManagement from './pages/admin/UserManagement';
import GlobalConfig from './pages/admin/GlobalConfig';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';

// Dashboard Logic
const DashboardDispatcher = () => {
  const { user } = useAuth();

  if (user?.role === 'CLIENT') return <ClientDashboard />;
  
  // Admin & Staff share the professional Dashboard
  if (['ADMIN', 'SUPERADMIN', 'STAFF'].includes(user?.role)) {
    return <Dashboard />;
  }

  return <div className="p-8">Initializing Dashboard...</div>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* === SEMI-PROTECTED (Onboarding) === */}
        <Route path="/auth/change-initial-password" element={<ChangeInitialPassword />} />

        {/* === PROTECTED APP ROUTES === */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardDispatcher />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* --- STAFF MODULES --- */}
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

        {/* --- SHARED MODULES --- */}
        <Route path="/contracts/:id" element={
          <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'SUPERADMIN', 'CLIENT']}>
            <MainLayout>
              <ContractDetail />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* --- CLIENT MODULES --- */}
        <Route path="/my-loans" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <MainLayout>
              <ClientDashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* --- ADMIN MODULES --- */}
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

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;