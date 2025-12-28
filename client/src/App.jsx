import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ChangeInitialPassword from './pages/auth/ChangeInitialPassword';

// Admin Pages
import ApprovalList from './pages/admin/ApprovalList';

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

        {/* Secured Routes with Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              {/* This is the default output for nested routes */}
              <Dashboard /> 
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* ADMIN ROUTES */}
        <Route 
          path="/approvals" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <MainLayout>
                <ApprovalList />
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