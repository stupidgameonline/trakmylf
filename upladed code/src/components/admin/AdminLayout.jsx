import { ArrowLeft, LogOut } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminNav from './AdminNav';
import { useAuth } from '../../contexts/AuthContext';

function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <main className="app-shell">
      <header className="section-card mb-3 flex items-center justify-between p-3">
        <button className="btn-soft !min-h-[40px] !px-3 text-xs" onClick={() => navigate('/')}>
          <span className="inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </span>
        </button>
        <p className="title-font text-sm uppercase text-accent">Admin Panel</p>
        <button
          className="btn-soft !min-h-[40px] !px-3 text-xs text-red-300"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <AdminNav />

      <div className="space-y-3">
        <Outlet />
      </div>
    </main>
  );
}

export default AdminLayout;
