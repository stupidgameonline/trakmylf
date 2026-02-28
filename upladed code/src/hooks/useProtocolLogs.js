import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase';
import { getDateKey, getDateRange } from '../utils/date';
import { getAutoProtocolItems } from '../data/protocol';
import { readLocal, writeLocal } from '../utils/localStore';

const allProtocolIds = ['no_fap', 'no_sugar', 'no_phone', 'headspace', 'completed_tasks', 'worked_out'];
const getFallbackKey = (dateKey) => `this-life:fallback:protocol:${dateKey}`;
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

export const fetchProtocolRange = async (startDate, endDate) => {
  const dates = getDateRange(startDate, endDate);
  const dateKeys = dates.map((date) => getDateKey(date));

  if (!isSupabaseConfigured) {
    return dateKeys.reduce((acc, key) => {
      acc[key] = readLocal(getFallbackKey(key), {});
      return acc;
    }, {});
  }

  const result = dateKeys.reduce((acc, key) => {
    acc[key] = {};
    return acc;
  }, {});

  for (const group of chunk(dateKeys, 80)) {
    const { data, error } = await supabase
      .from('protocol_logs')
      .select('date, item_id, status, zone, auto, updated_at')
      .in('date', group);

    if (error) {
      group.forEach((key) => {
        result[key] = readLocal(getFallbackKey(key), {});
      });
      continue;
    }

    (data || []).forEach((row) => {
      if (!result[row.date]) result[row.date] = {};
      result[row.date][row.item_id] = {
        status: row.status,
        zone: row.zone,
        auto: row.auto,
        timestamp: row.updated_at
      };
    });
  }

  return result;
};

export default function useProtocolLogs(items, zone, dayType, date = new Date()) {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState({});
  const dateKey = getDateKey(date);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);

      if (!isSupabaseConfigured) {
        if (!active) return;
        setLogs(readLocal(getFallbackKey(dateKey), {}));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('protocol_logs')
        .select('item_id, status, zone, auto, updated_at')
        .eq('date', dateKey);

      if (!active) return;

      if (error) {
        setLogs(readLocal(getFallbackKey(dateKey), {}));
        setLoading(false);
        return;
      }

      const map = {};
      (data || []).forEach((row) => {
        map[row.item_id] = {
          status: row.status,
          zone: row.zone,
          auto: row.auto,
          timestamp: row.updated_at
        };
      });
      setLogs(map);
      setLoading(false);
    };

    run();

    return () => {
      active = false;
    };
  }, [dateKey]);

  useEffect(() => {
    const autoItems = getAutoProtocolItems(zone, dayType);
    if (!autoItems.length) return;

    const autoStatus = dayType === 'SUNDAY' ? 'na' : 'passed';

    if (!isSupabaseConfigured) {
      setLogs((prev) => {
        const next = { ...prev };
        autoItems.forEach((itemId) => {
          if (!next[itemId]) {
            next[itemId] = {
              status: autoStatus,
              zone,
              auto: true,
              timestamp: new Date().toISOString()
            };
          }
        });
        writeLocal(getFallbackKey(dateKey), next);
        return next;
      });
      return;
    }

    const run = async () => {
      const { data, error: readError } = await supabase
        .from('protocol_logs')
        .select('item_id')
        .eq('date', dateKey)
        .in('item_id', autoItems);

      if (readError) {
        setLogs((prev) => {
          const next = { ...prev };
          autoItems.forEach((itemId) => {
            if (!next[itemId]) {
              next[itemId] = {
                status: autoStatus,
                zone,
                auto: true,
                timestamp: new Date().toISOString()
              };
            }
          });
          writeLocal(getFallbackKey(dateKey), next);
          return next;
        });
        return;
      }

      const existing = new Set((data || []).map((row) => row.item_id));
      const missing = autoItems.filter((id) => !existing.has(id));
      if (!missing.length) return;

      const { error } = await supabase.from('protocol_logs').upsert(
        missing.map((itemId) => ({
          date: dateKey,
          item_id: itemId,
          status: autoStatus,
          zone,
          auto: true,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'date,item_id' }
      );
      if (error) {
        setLogs((prev) => {
          writeLocal(getFallbackKey(dateKey), prev);
          return prev;
        });
      }

      setLogs((prev) => {
        const next = { ...prev };
        missing.forEach((itemId) => {
          next[itemId] = {
            status: autoStatus,
            zone,
            auto: true,
            timestamp: new Date().toISOString()
          };
        });
        return next;
      });
    };

    run();
  }, [dateKey, dayType, zone]);

  const markProtocol = useCallback(
    async (itemId, status) => {
      const ts = new Date().toISOString();

      setLogs((prev) => {
        const next = {
          ...prev,
          [itemId]: {
            ...(prev[itemId] || {}),
            status,
            zone,
            timestamp: ts
          }
        };
        if (!isSupabaseConfigured) {
          writeLocal(getFallbackKey(dateKey), next);
        }
        return next;
      });

      setStreaks((prev) => {
        const list = prev[itemId] || [];
        const updated = [...list];
        const targetIdx = updated.findIndex((entry) => entry.dateKey === dateKey);
        if (targetIdx >= 0) {
          updated[targetIdx] = { ...updated[targetIdx], status };
        } else {
          updated.push({ dateKey, status });
        }
        return { ...prev, [itemId]: updated };
      });

      if (!isSupabaseConfigured) return;

      const { error } = await supabase.from('protocol_logs').upsert(
        {
          date: dateKey,
          item_id: itemId,
          status,
          zone,
          auto: false,
          updated_at: ts
        },
        { onConflict: 'date,item_id' }
      );
      if (error) {
        setLogs((prev) => {
          writeLocal(getFallbackKey(dateKey), prev);
          return prev;
        });
      }
    },
    [dateKey, zone]
  );

  useEffect(() => {
    const now = new Date();
    const dates = Array.from({ length: 30 }, (_, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - idx));
      return d;
    });
    const dateKeys = dates.map((d) => getDateKey(d));

    const run = async () => {
      if (!isSupabaseConfigured) {
        const data = allProtocolIds.map((itemId) => {
          const dayLogs = dateKeys.map((key) => {
            const map = readLocal(getFallbackKey(key), {});
            return { dateKey: key, status: map[itemId]?.status || null };
          });
          return [itemId, dayLogs];
        });

        setStreaks(Object.fromEntries(data));
        return;
      }

      const { data, error } = await supabase
        .from('protocol_logs')
        .select('date, item_id, status')
        .in('date', dateKeys);

      if (error) {
        const fallback = allProtocolIds.map((itemId) => [
          itemId,
          dateKeys.map((key) => ({ dateKey: key, status: null }))
        ]);
        setStreaks(Object.fromEntries(fallback));
        return;
      }

      const byItemDate = {};
      (data || []).forEach((row) => {
        if (!byItemDate[row.item_id]) byItemDate[row.item_id] = {};
        byItemDate[row.item_id][row.date] = row.status;
      });

      const series = allProtocolIds.map((itemId) => [
        itemId,
        dateKeys.map((key) => ({ dateKey: key, status: byItemDate[itemId]?.[key] || null }))
      ]);

      setStreaks(Object.fromEntries(series));
    };

    run();
  }, [dateKey]);

  const stats = useMemo(() => {
    const passed = items.filter((item) => logs[item.id]?.status === 'passed').length;
    const failed = items.filter((item) => logs[item.id]?.status === 'failed').length;
    const total = items.length;
    return { passed, failed, total };
  }, [items, logs]);

  return {
    logs,
    streaks,
    loading,
    markProtocol,
    dateKey,
    ...stats
  };
}
