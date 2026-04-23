import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PresentationProvider } from './context/PresentationContext';
import { ThemeProvider } from './context/ThemeContext';
import { TooltipProvider } from './components/ui/Tooltip';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import CommandPalette, { CommandPaletteProvider } from './components/CommandPalette';

/* ── Lazy-loaded routes (code splitting) ── */
const Login            = lazy(() => import('./pages/Login'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const VehicleSelection = lazy(() => import('./pages/VehicleSelection'));
const SlideDeck        = lazy(() => import('./pages/SlideDeck'));
const PresentationStart = lazy(() => import('./pages/PresentationStart'));
const Settings         = lazy(() => import('./pages/Settings'));
const Reports          = lazy(() => import('./pages/Reports'));
const NotFound         = lazy(() => import('./pages/NotFound'));
const ClientView       = lazy(() => import('./pages/ClientView'));
const Takeaway         = lazy(() => import('./pages/Takeaway'));
const MenuSelling      = lazy(() => import('./pages/MenuSelling'));

const AdminLayout      = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const DealerManagement = lazy(() => import('./pages/admin/DealerManagement'));
const AdminReports     = lazy(() => import('./pages/admin/AdminReports'));

/* ── Protected Route ── */
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userProfile?.role !== 'superAdmin') return <Navigate to="/dashboard" replace />;
  return children;
}

/* ── Loading screen prestige ── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      gap: '2rem',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '1.8rem',
        color: 'var(--text-primary)',
        letterSpacing: '-0.03em',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.4rem',
      }}>
        Avantage <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--or-700)' }}>Plus</span>
      </div>
      <div style={{
        width: 36, height: 36,
        border: '2.5px solid var(--graphite-200)',
        borderTopColor: 'var(--or-700)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)', letterSpacing: '0.06em' }}>
        Chargement…
      </div>
    </div>
  );
}

/* ── App Routes ── */
function AppRoutes() {
  const { currentUser, userProfile } = useAuth();

  const homePath = !currentUser ? '/login'
    : userProfile?.role === 'superAdmin' ? '/admin'
    : '/dashboard';

  return (
    <PresentationProvider>
      <CommandPaletteProvider>
        <a href="#main-content" className="skip-to-content">Aller au contenu principal</a>
        <CommandPalette />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/login"         element={<Login />} />
            <Route path="/t/:token"      element={<Takeaway />} />
            <Route path="/client-view/:sessionId" element={<ClientView />} />

            {/* Redirect root */}
            <Route path="/" element={<Navigate to={homePath} replace />} />

            {/* Protected seller/dealer routes */}
            <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/select-vehicle"  element={<ProtectedRoute><VehicleSelection /></ProtectedRoute>} />
            <Route path="/presentation/start" element={<ProtectedRoute><PresentationStart /></ProtectedRoute>} />
            <Route path="/presentation"    element={<ProtectedRoute><SlideDeck /></ProtectedRoute>} />
            <Route path="/settings"        element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reports"         element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/menu"            element={<ProtectedRoute><MenuSelling /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index               element={<AdminDashboard />} />
              <Route path="dealers"      element={<DealerManagement />} />
              <Route path="reports"      element={<AdminReports />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </CommandPaletteProvider>
    </PresentationProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
