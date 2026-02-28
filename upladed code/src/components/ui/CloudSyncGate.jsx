import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { pullCloudState, scheduleCloudPush } from '../../utils/cloudSync';

function CloudSyncGate({ children }) {
  const { isAuthenticated } = useAuth();
  const [ready, setReady] = useState(() => !isAuthenticated);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!isAuthenticated) {
        if (active) setReady(true);
        return;
      }

      if (active) setReady(false);
      await pullCloudState();
      scheduleCloudPush(0);
      if (active) setReady(true);
    };

    bootstrap();

    const onReconnect = () => {
      scheduleCloudPush(150);
    };
    window.addEventListener('online', onReconnect);

    return () => {
      active = false;
      window.removeEventListener('online', onReconnect);
    };
  }, [isAuthenticated]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-[480px] px-3 py-4">
        <div className="section-card h-28 animate-pulse rounded-2xl bg-zinc-900/70" />
      </div>
    );
  }

  return children;
}

export default CloudSyncGate;
