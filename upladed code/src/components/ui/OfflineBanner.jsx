import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

function OfflineBanner() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="sticky top-0 z-[70] border-b border-yellow-500/30 bg-yellow-600/10 px-3 py-2 text-xs text-yellow-200 backdrop-blur">
      <div className="mx-auto flex max-w-[480px] items-center gap-2">
        <WifiOff className="h-4 w-4" />
        Offline - changes will sync when connected
      </div>
    </div>
  );
}

export default OfflineBanner;
