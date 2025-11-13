// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrganizationDetail from './pages/admin/OrganizationDetail';
import Organizations from './pages/admin/Organizations';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/Messages'; // 🔥 NEW - CHAT SYSTEM
import OrganizationDashboard from './pages/organization/OrganizationDashboard';
import SubmitStatistics from './pages/organization/SubmitStatistics';
import BulkUpload from './pages/organization/BulkUpload';
import OrgReports from './pages/organization/Reports';
import OrgSettings from './pages/organization/Settings';
import OrgMessages from './pages/organization/Messages'; // 🔥 NEW - CHAT SYSTEM
import { useAppStore } from './store';
import { Toaster } from 'react-hot-toast';

// 🔔 Import Notification Components
import NotificationCenter from './components/notifications/NotificationCenter';
import ToastNotification from './components/notifications/ToastNotification';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, currentUser } = useAppStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function App() {
  const { isAuthenticated, currentUser } = useAppStore();

  return (
    <Router>
      {/* React Hot Toast */}
      <Toaster position="top-right" />
      
      {/* 🔔 Global Notification Components */}
      <NotificationCenter />
      <ToastNotification />

      <Routes>
        {/* LOGIN ROUTE */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={currentUser?.role === 'fia_admin' ? '/admin/dashboard' : '/organization/dashboard'} />
            ) : (
              <LoginPage />
            )
          } 
        />

        {/* ============================================ */}
        {/*              ADMIN ROUTES                    */}
        {/* ============================================ */}

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['fia_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Organizations Management (CRUD) */}
        <Route
          path="/admin/organizations"
          element={
            <ProtectedRoute allowedRoles={['fia_admin']}>
              <Organizations />
            </ProtectedRoute>
          }
        />

        {/* Organization Detail View */}
        <Route
          path="/admin/organization/:orgId"
          element={
            <ProtectedRoute allowedRoles={['fia_admin']}>
              <OrganizationDetail />
            </ProtectedRoute>
          }
        />

        {/* 🔥 Admin Messages - CHAT SYSTEM */}
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={['fia_admin']}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />

        {/* Admin Reports & Analytics */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['fia_admin']}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        {/* Admin Settings */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['fia_admin']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/*         ORGANIZATION ROUTES                  */}
        {/* ============================================ */}

        {/* Organization Dashboard */}
        <Route
          path="/organization/dashboard"
          element={
            <ProtectedRoute allowedRoles={['org_admin', 'org_user']}>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Submit Statistics */}
        <Route
          path="/organization/submit"
          element={
            <ProtectedRoute allowedRoles={['org_admin', 'org_user']}>
              <SubmitStatistics />
            </ProtectedRoute>
          }
        />
        
        {/* Bulk Upload Excel */}
        <Route
          path="/organization/upload"
          element={
            <ProtectedRoute allowedRoles={['org_admin', 'org_user']}>
              <BulkUpload />
            </ProtectedRoute>
          }
        />

        {/* 🔥 Organization Messages - CHAT SYSTEM */}
        <Route
          path="/organization/messages"
          element={
            <ProtectedRoute allowedRoles={['org_admin', 'org_user']}>
              <OrgMessages />
            </ProtectedRoute>
          }
        />
        
        {/* Organization Reports */}
        <Route
          path="/organization/reports"
          element={
            <ProtectedRoute allowedRoles={['org_admin', 'org_user']}>
              <OrgReports />
            </ProtectedRoute>
          }
        />
        
        {/* Organization Settings */}
        <Route
          path="/organization/settings"
          element={
            <ProtectedRoute allowedRoles={['org_admin', 'org_user']}>
              <OrgSettings />
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/*           DEFAULT & FALLBACK ROUTES          */}
        {/* ============================================ */}

        {/* Root Route - Redirect based on auth & role */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={currentUser?.role === 'fia_admin' ? '/admin/dashboard' : '/organization/dashboard'} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch-all - Redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;