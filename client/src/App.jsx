import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout'; // Import Layout

// Komponen Penjaga (Guard)
const ProtectedRoute = ({ children }) => {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return <Navigate to="/login" replace />;

  // WRAPPER: Bungkus halaman dengan Layout
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Dashboard sekarang otomatis punya Sidebar & Header */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Nanti kita tambah route lain disini: /contracts, /clients */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;