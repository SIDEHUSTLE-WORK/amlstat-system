// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';  // 🔥 IMPORT LANDING PAGE!
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrganizationDetail from './pages/admin/OrganizationDetail';
import Organizations from './pages/admin/Organizations';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/Messages';
import OrganizationDashboard from './pages/organization/OrganizationDashboard';
import SubmitStatistics from './pages/organization/SubmitStatistics';
import BulkUpload from './pages/organization/BulkUpload';
import OrgReports from './pages/organization/Reports';
import OrgSettings from './pages/organization/Settings';
import OrgMessages from './pages/organization/Messages';
import { useAppStore } from './store';
import { Toaster } from 'react-hot-toast';

// 🔔 Import Notification Components
import NotificationCenter from './components/notifications/NotificationCenter';
import ToastNotification from './components/notifications/ToastNotification';

// 🔥 Loading Screen Component
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fia-navy via-fia-navy-light to-fia-teal flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-fia-gold rounded-full mb-4 shadow-xl animate-pulse">
          <span className="text-5xl">🇺🇬</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          AML/CFT Statistics Portal
        </h2>
        <div className="flex items-center justify-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-fia-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-fia-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-fia-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

// 🔥 Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, currentUser } = useAppStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { isAuthenticated, currentUser, isCheckingAuth } = useAppStore();

  // 🔥 Show loading screen while checking auth
  if (isCheckingAuth) {
    return <AuthLoadingScreen />;
  }

  return (
    <Router>
      {/* React Hot Toast */}
      <Toaster position="top-right" />
      
      {/* 🔔 Global Notification Components */}
      <NotificationCenter />
      <ToastNotification />

      <Routes>
        {/* 🔥 LANDING PAGE - COMES FIRST! */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              // If already logged in, redirect to appropriate dashboard
              <Navigate to={currentUser?.role === 'FIA_ADMIN' || currentUser?.role === 'FIA_ANALYST' ? '/admin/dashboard' : '/org/dashboard'} replace />
            ) : (
              // Show landing page for non-authenticated users
              <LandingPage />
            )
          } 
        />

        {/* 🔥 LOGIN ROUTE */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              // If already logged in, redirect to appropriate dashboard
              <Navigate to={currentUser?.role === 'FIA_ADMIN' || currentUser?.role === 'FIA_ANALYST' ? '/admin/dashboard' : '/org/dashboard'} replace />
            ) : (
              <LoginPage />
            )
          } 
        />

        {/* ============================================ */}
        {/*              ADMIN ROUTES                    */}
        {/* ============================================ */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['FIA_ADMIN', 'FIA_ANALYST']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/organizations"
          element={
            <ProtectedRoute allowedRoles={['FIA_ADMIN', 'FIA_ANALYST']}>
              <Organizations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/organization/:orgId"
          element={
            <ProtectedRoute allowedRoles={['FIA_ADMIN', 'FIA_ANALYST']}>
              <OrganizationDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={['FIA_ADMIN', 'FIA_ANALYST']}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['FIA_ADMIN', 'FIA_ANALYST']}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['FIA_ADMIN', 'FIA_ANALYST']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/*         ORGANIZATION ROUTES                  */}
        {/* ============================================ */}

        <Route
          path="/org/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_USER']}>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/org/submit"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_USER']}>
              <SubmitStatistics />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/org/upload"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_USER']}>
              <BulkUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/org/messages"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_USER']}>
              <OrgMessages />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/org/reports"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_USER']}>
              <OrgReports />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/org/settings"
          element={
            <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_USER']}>
              <OrgSettings />
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/*           FALLBACK ROUTE                     */}
        {/* ============================================ */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;