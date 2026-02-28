import { Bolt, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function HeaderBar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <header className="section-card mb-3 flex items-center justify-between border border-borderSubtle bg-card px-4 py-3">
      <div className="flex items-center gap-2 text-accent">
        <Bolt className="h-5 w-5" />
        <p className="title-font text-sm font-bold tracking-[0.2em]">THIS LIFE</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-soft !min-h-[40px] !px-3 text-xs text-accent" onClick={() => navigate('/admin')}>
          <span className="inline-flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Admin
          </span>
        </button>
        <button
          className="btn-soft !min-h-[40px] !px-3 text-xs text-red-300"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export default HeaderBar;
