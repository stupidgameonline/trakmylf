import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase';
import { getDateKey, getDateRange } from '../utils/date';
import { readLocal, writeLocal } from '../utils/localStore';

const getFallbackKey = (dateKey) => `this-life:fallback:timetable:${dateKey}`;
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

export const fetchTimetableRange = async (startDate, endDate) => {
  const dates = getDateRange(startDate, endDate);
  const dateKeys = dates.map((date) => getDateKey(date));

  if (!isSupabaseConfigured) {
    return dateKeys.reduce((acc, key) => {
      acc[key] = readLocal(getFallbackKey(key), {});
      return acc;
    }, {});
  }

  const statusMapByDate = dateKeys.reduce((acc, key) => {
    acc[key] = {};
    return acc;
  }, {});

  for (const group of chunk(dateKeys, 80)) {
    const { data, error } = await supabase
      .from('timetable_logs')
      .select('date, task_id, status, zone, updated_at')
      .in('date', group);

    if (error) {
      group.forEach((key) => {
        statusMapByDate[key] = readLocal(getFallbackKey(key), {});
      });
      continue;
    }

    (data || []).forEach((row) => {
      if (!statusMapByDate[row.date]) statusMapByDate[row.date] = {};
      statusMapByDate[row.date][row.task_id] = {
        status: row.status,
        zone: row.zone,
        timestamp: row.updated_at
      };
    });
  }

  return statusMapByDate;
};

export default function useTimetableLogs(tasks, zone, date = new Date()) {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
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
        .from('timetable_logs')
        .select('task_id, status, zone, updated_at')
        .eq('date', dateKey);

      if (!active) return;

      if (error) {
        setLogs(readLocal(getFallbackKey(dateKey), {}));
        setLoading(false);
        return;
      }

      const map = {};
      (data || []).forEach((row) => {
        map[row.task_id] = {
          status: row.status,
          zone: row.zone,
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

  const markTask = useCallback(
    async (taskId, status) => {
      setLogs((prev) => {
        const next = {
          ...prev,
          [taskId]: {
            ...(prev[taskId] || {}),
            status,
            zone,
            timestamp: new Date().toISOString()
          }
        };
        if (!isSupabaseConfigured) {
          writeLocal(getFallbackKey(dateKey), next);
        }
        return next;
      });

      if (!isSupabaseConfigured) return;

      const { error } = await supabase.from('timetable_logs').upsert(
        {
          date: dateKey,
          task_id: taskId,
          status,
          zone,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'date,task_id' }
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

  const nonOptionalTasks = useMemo(() => tasks.filter((task) => !task.optional), [tasks]);

  const stats = useMemo(() => {
    const complete = nonOptionalTasks.filter((task) => logs[task.id]?.status === 'complete').length;
    const failed = nonOptionalTasks.filter((task) => logs[task.id]?.status === 'failed').length;
    const total = nonOptionalTasks.length;
    const progress = total ? Math.round((complete / total) * 100) : 0;
    return { complete, failed, total, progress };
  }, [logs, nonOptionalTasks]);

  return {
    logs,
    loading,
    markTask,
    dateKey,
    ...stats
  };
}
