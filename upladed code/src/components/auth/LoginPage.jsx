import { Bolt, Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const fullDate = useMemo(() => format(new Date(), 'MMMM do, yyyy'), []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (event) => {
    event.preventDefault();
    const ok = login(code.trim());
    if (ok) {
      setError(false);
      navigate('/');
      return;
    }
    setError(true);
  };

  return (
    <main className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[480px] flex-col gap-4">
        <section className="section-card border border-accent/30 bg-zinc-950/70 p-6 text-center shadow-glowAccent">
          <div className="mb-3 flex items-center justify-center gap-2 text-accent">
            <Bolt className="h-8 w-8" />
            <h1 className="title-font text-3xl font-black tracking-[0.25em]">THIS LIFE</h1>
          </div>

          <div className="mb-4 rounded-xl border border-zinc-700 bg-cardAlt p-4 text-center text-sm italic text-zinc-300">
            "I was born alone & I will die alone & I am experiencing this alone & so I work alone too, I don't need anyone to
            motivate me"
          </div>

          <div className="mb-4 rounded-xl border border-accent/40 bg-gradient-to-r from-accent/20 via-emerald-500/10 to-emerald-400/20 p-4 text-center">
            <p className="title-font text-sm uppercase text-accent">Make {fullDate} the best day of my life.</p>
            <p className="mt-2 text-xs text-zinc-200">Look the best, do the best, live the best - if you're breathing, be your best.</p>
          </div>

          <form className={`rounded-xl border border-accent/25 bg-card p-4 ${error ? 'animate-shake' : ''}`} onSubmit={onSubmit}>
            <Lock className="mx-auto mb-3 h-10 w-10 text-accent" />
            <input
              className="input-dark mb-3 border-accent/55 text-center"
              placeholder="Enter access code..."
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                if (error) setError(false);
              }}
              type="password"
            />
            <button type="submit" className="btn-primary w-full title-font tracking-[0.08em]">
              ENTER THE ZONE
            </button>
            {error && <p className="mt-3 text-sm font-semibold text-danger">Access Denied</p>}
          </form>
        </section>

        <p className="mt-auto text-center text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-textSecondary">
          THIS LIFE v2.0 - YOUR PERSONAL OPERATING SYSTEM
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
