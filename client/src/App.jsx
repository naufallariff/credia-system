import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChangeInitialPassword from './pages/auth/ChangeInitialPassword';

// Admin Pages
import ApprovalList from './pages/admin/ApprovalList';
import UserManagement from './pages/admin/UserManagement';

// Staff Pages
import ContractList from './pages/staff/ContractList';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';

import { useAuth } from './hooks/useAuth';

// Create a Smart Dashboard Switcher
const DashboardDispatcher = () => {
  const { user } = useAuth();

  if (user?.role === 'CLIENT') {
    return <ClientDashboard />;
  }

  // For Admin and Staff, show a generic dashboard or Redirect to Contracts
  // For now, let's keep the simple placeholder or redirect
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.name}</h1>
      <p className="text-slate-500 mt-2">Select a menu from the sidebar to get started.</p>
    </div>
  );
};

// Placeholder Pages (To avoid crash before development)
const Dashboard = () => <div className="text-slate-700">Welcome to Credia Enterprise V3.0</div>;
const NotFound = () => <div className="text-center mt-20 text-slate-500">Page Not Found</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Semi-Protected (Change Password Flow) */}
        <Route
          path="/auth/change-initial-password"
          element={
            // No MainLayout here, just the form
            <ChangeInitialPassword />
          }
        />

        {/* Secured Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardDispatcher />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* ADMIN: User Management */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* STAFF ROUTES */}
        <Route
          path="/contracts/new"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'SUPERADMIN']}>
              <MainLayout>
                <CreateContract />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'SUPERADMIN']}>
              <MainLayout>
                <ContractList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* CLIENT: My Loans (Explicit Route) */}
        <Route
          path="/my-loans"
          element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <MainLayout>
                <ClientDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* SHARED ROUTES (Detail View) */}
        <Route
          path="/contracts/:id"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN', 'SUPERADMIN', 'CLIENT']}>
              <MainLayout>
                <ContractDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;