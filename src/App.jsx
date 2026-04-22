import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PresentationProvider } from './context/PresentationContext';

// Pages
import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import VehicleSelection from './pages/VehicleSelection';
import SlideDeck       from './pages/SlideDeck';
import Settings        from './pages/Settings';
import Reports         from './pages/Reports';

// Admin
import AdminLayout     from './pages/admin/AdminLayout';
import AdminDashboard  from './pages/admin/AdminDashboard';
import DealerManagement from './pages/admin/DealerManagement';
import AdminReports    from './pages/admin/AdminReports';

/* ── Protected Route ── */
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

/* ── Admin Route ── */
function AdminRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userProfile?.role !== 'superAdmin') return <Navigate to="/dashboard" replace />;
  return children;
}

/* ── Loading screen ── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#FFFFFF',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      }}>
        <div style={{
          fontSize: '1.75rem', fontWeight: 800, color: '#1A1A1A',
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
          letterSpacing: '-0.03em',
        }}>
          Avantage <span style={{ color: '#D62828' }}>Plus</span>
        </div>
        <div style={{
          width: 36, height: 36, border: '3px solid #F0F0F0',
          borderTopColor: '#D62828', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500 }}>
          Chargement…
        </div>
      </div>
    </div>
  );
}

/* ── App Routes ── */
function AppRoutes() {
  const { currentUser, userProfile, loading } = useAuth();

  // Auto-redirect to admin if superAdmin visits /
  const homePath = !currentUser ? '/login'
    : userProfile?.role === 'superAdmin' ? '/admin'
    : '/dashboard';

  return (
    <PresentationProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to={homePath} replace />} />

        {/* Protected seller/dealer routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/select-vehicle" element={<ProtectedRoute><VehicleSelection /></ProtectedRoute>} />
        <Route path="/presentation" element={<ProtectedRoute><SlideDeck /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dealers" element={<DealerManagement />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={homePath} replace />} />
      </Routes>
    </PresentationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
