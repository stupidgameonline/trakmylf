import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase';
import { getDateKey } from '../utils/date';
import { readLocal, writeLocal } from '../utils/localStore';

const CONNECTIONS_KEY = 'this-life:fallback:connections';

export default function useConnections(date = new Date()) {
  const dateKey = getDateKey(date);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const map = readLocal(CONNECTIONS_KEY, {});
      setCount(Number(map[dateKey]?.count || 0));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from('connections').select('count').eq('date', dateKey).maybeSingle();
    if (error) {
      const map = readLocal(CONNECTIONS_KEY, {});
      setCount(Number(map[dateKey]?.count || 0));
      setLoading(false);
      return;
    }

    setCount(Number(data?.count || 0));
    setLoading(false);
  }, [dateKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveCount = useCallback(
    async (nextCount) => {
      const bounded = Math.max(0, Number(nextCount || 0));
      setCount(bounded);

      if (!isSupabaseConfigured) {
        const map = readLocal(CONNECTIONS_KEY, {});
        map[dateKey] = { count: bounded, updatedAt: new Date().toISOString() };
        writeLocal(CONNECTIONS_KEY, map);
        return;
      }

      const { error } = await supabase.from('connections').upsert(
        {
          date: dateKey,
          count: bounded,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'date' }
      );
      if (error) {
        const map = readLocal(CONNECTIONS_KEY, {});
        map[dateKey] = { count: bounded, updatedAt: new Date().toISOString() };
        writeLocal(CONNECTIONS_KEY, map);
      }
    },
    [dateKey]
  );

  return {
    dateKey,
    loading,
    count,
    setCount,
    saveCount,
    refresh
  };
}
