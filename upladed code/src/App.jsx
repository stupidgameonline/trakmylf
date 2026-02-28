import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OfflineBanner from './components/ui/OfflineBanner';
import BackendStatusBanner from './components/ui/BackendStatusBanner';
import CloudSyncGate from './components/ui/CloudSyncGate';

const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const HomePage = lazy(() => import('./components/home/HomePage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const DashboardPage = lazy(() => import('./components/admin/DashboardPage'));
const TimetableAdminPage = lazy(() => import('./components/admin/TimetableAdminPage'));
const ProtocolAdminPage = lazy(() => import('./components/admin/ProtocolAdminPage'));
const WorkMeetingsAdminPage = lazy(() => import('./components/admin/WorkMeetingsAdminPage'));
const IdeasAdminPage = lazy(() => import('./components/admin/IdeasAdminPage'));
const BrandsAdminPage = lazy(() => import('./components/admin/BrandsAdminPage'));
const PlanningAdminPage = lazy(() => import('./components/admin/PlanningAdminPage'));
const SettingsAdminPage = lazy(() => import('./components/admin/SettingsAdminPage'));

function AppLoader() {
  return (
    <div className="mx-auto max-w-[480px] px-3 py-4">
      <div className="section-card h-28 animate-pulse rounded-2xl bg-zinc-900/70" />
    </div>
  );
}

function App() {
  return (
    <>
      <OfflineBanner />
      <BackendStatusBanner />
      <CloudSyncGate>
        <Suspense fallback={<AppLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="timetable" element={<TimetableAdminPage />} />
              <Route path="protocol" element={<ProtocolAdminPage />} />
              <Route path="work" element={<WorkMeetingsAdminPage />} />
              <Route path="work-meetings" element={<WorkMeetingsAdminPage />} />
              <Route path="ideas" element={<IdeasAdminPage />} />
              <Route path="brands" element={<BrandsAdminPage />} />
              <Route path="planning" element={<PlanningAdminPage />} />
              <Route path="settings" element={<SettingsAdminPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </CloudSyncGate>
    </>
  );
}

export default App;
