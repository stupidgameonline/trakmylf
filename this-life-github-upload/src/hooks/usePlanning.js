import { useCallback } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase';
import { readLocal, writeLocal } from '../utils/localStore';

const MONTHLY_KEY = 'this-life:fallback:planning:monthly';
const WEEKLY_KEY = 'this-life:fallback:planning:weekly';
const DAILY_KEY = 'this-life:fallback:planning:daily';

export default function usePlanning() {
  const getMonthly = useCallback(async (monthKey) => {
    if (!isSupabaseConfigured) {
      return readLocal(MONTHLY_KEY, {})[monthKey] || { goals: [], notes: '' };
    }

    const { data, error } = await supabase.from('planning_monthly').select('goals, notes').eq('month_key', monthKey).maybeSingle();
    if (error) {
      return readLocal(MONTHLY_KEY, {})[monthKey] || { goals: [], notes: '' };
    }
    return data ? { goals: data.goals || [], notes: data.notes || '' } : { goals: [], notes: '' };
  }, []);

  const saveMonthly = useCallback(async (monthKey, payload) => {
    if (!isSupabaseConfigured) {
      const map = readLocal(MONTHLY_KEY, {});
      map[monthKey] = { ...payload, createdAt: new Date().toISOString() };
      writeLocal(MONTHLY_KEY, map);
      return;
    }

    const { error } = await supabase.from('planning_monthly').upsert(
      {
        month_key: monthKey,
        goals: payload.goals || [],
        notes: payload.notes || '',
        created_at: new Date().toISOString()
      },
      { onConflict: 'month_key' }
    );
    if (error) {
      const map = readLocal(MONTHLY_KEY, {});
      map[monthKey] = { ...payload, createdAt: new Date().toISOString() };
      writeLocal(MONTHLY_KEY, map);
    }
  }, []);

  const getWeekly = useCallback(async (weekKey) => {
    if (!isSupabaseConfigured) {
      return readLocal(WEEKLY_KEY, {})[weekKey] || { goals: [], tasks: [], notes: '' };
    }

    const { data, error } = await supabase.from('planning_weekly').select('goals, tasks, notes').eq('week_key', weekKey).maybeSingle();
    if (error) {
      return readLocal(WEEKLY_KEY, {})[weekKey] || { goals: [], tasks: [], notes: '' };
    }
    return data ? { goals: data.goals || [], tasks: data.tasks || [], notes: data.notes || '' } : { goals: [], tasks: [], notes: '' };
  }, []);

  const saveWeekly = useCallback(async (weekKey, payload) => {
    if (!isSupabaseConfigured) {
      const map = readLocal(WEEKLY_KEY, {});
      map[weekKey] = { ...payload, createdAt: new Date().toISOString() };
      writeLocal(WEEKLY_KEY, map);
      return;
    }

    const { error } = await supabase.from('planning_weekly').upsert(
      {
        week_key: weekKey,
        goals: payload.goals || [],
        tasks: payload.tasks || [],
        notes: payload.notes || '',
        created_at: new Date().toISOString()
      },
      { onConflict: 'week_key' }
    );
    if (error) {
      const map = readLocal(WEEKLY_KEY, {});
      map[weekKey] = { ...payload, createdAt: new Date().toISOString() };
      writeLocal(WEEKLY_KEY, map);
    }
  }, []);

  const getDaily = useCallback(async (dateKey) => {
    if (!isSupabaseConfigured) {
      return readLocal(DAILY_KEY, {})[dateKey] || { notes: '', goals: [] };
    }

    const { data, error } = await supabase.from('planning_daily').select('goals, notes').eq('date', dateKey).maybeSingle();
    if (error) {
      return readLocal(DAILY_KEY, {})[dateKey] || { notes: '', goals: [] };
    }
    return data ? { goals: data.goals || [], notes: data.notes || '' } : { notes: '', goals: [] };
  }, []);

  const saveDaily = useCallback(async (dateKey, payload) => {
    if (!isSupabaseConfigured) {
      const map = readLocal(DAILY_KEY, {});
      map[dateKey] = { ...payload, createdAt: new Date().toISOString() };
      writeLocal(DAILY_KEY, map);
      return;
    }

    const { error } = await supabase.from('planning_daily').upsert(
      {
        date: dateKey,
        goals: payload.goals || [],
        notes: payload.notes || '',
        created_at: new Date().toISOString()
      },
      { onConflict: 'date' }
    );
    if (error) {
      const map = readLocal(DAILY_KEY, {});
      map[dateKey] = { ...payload, createdAt: new Date().toISOString() };
      writeLocal(DAILY_KEY, map);
    }
  }, []);

  const listMonthly = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const map = readLocal(MONTHLY_KEY, {});
      return Object.entries(map).map(([id, value]) => ({ id, ...value }));
    }

    const { data, error } = await supabase.from('planning_monthly').select('*').order('month_key', { ascending: false });
    if (error) {
      const map = readLocal(MONTHLY_KEY, {});
      return Object.entries(map).map(([id, value]) => ({ id, ...value }));
    }

    return (data || []).map((row) => ({
      id: row.month_key,
      goals: row.goals || [],
      notes: row.notes || '',
      createdAt: row.created_at
    }));
  }, []);

  return {
    getMonthly,
    saveMonthly,
    getWeekly,
    saveWeekly,
    getDaily,
    saveDaily,
    listMonthly
  };
}
