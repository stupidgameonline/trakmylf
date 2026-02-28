import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentZone, getDayType, getDaysRemainingInZone } from '../utils/date';

const ZONE_CACHE_KEY = 'this-life-last-zone';

const ZoneContext = createContext(null);

export function ZoneProvider({ children }) {
  const [now, setNow] = useState(new Date());
  const [zoneChangeMessage, setZoneChangeMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentZone = getCurrentZone(now);
  const dayType = getDayType(now);
  const daysRemainingInZone = getDaysRemainingInZone(now);

  useEffect(() => {
    const previous = sessionStorage.getItem(ZONE_CACHE_KEY);
    let timeout;

    if (previous && previous !== currentZone) {
      const readable = currentZone === 'NOMAD' ? 'Digital Nomad Mode Active' : 'Working Mode Active';
      setZoneChangeMessage(`🔄 Zone Changed: ${readable}`);
      timeout = setTimeout(() => setZoneChangeMessage(''), 5000);
    }

    sessionStorage.setItem(ZONE_CACHE_KEY, currentZone);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentZone]);

  const value = useMemo(
    () => ({
      now,
      currentZone,
      dayType,
      daysRemainingInZone,
      zoneChangeMessage,
      isNomad: currentZone === 'NOMAD',
      isWorking: currentZone === 'WORKING',
      isSunday: dayType === 'SUNDAY',
      isWednesday: dayType === 'WEDNESDAY'
    }),
    [now, currentZone, dayType, daysRemainingInZone, zoneChangeMessage]
  );

  return <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>;
}

export function useZone() {
  const context = useContext(ZoneContext);
  if (!context) {
    throw new Error('useZone must be used inside ZoneProvider');
  }
  return context;
}
