import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase';
import { getDateKey } from '../utils/date';
import { readLocal, removeLocal, writeLocal } from '../utils/localStore';

const defaultSettings = {
  dreamVersionDescription: 'Build an unstoppable body, mind, and business machine.',
  countdownStartDate: getDateKey(),
  lastVisitDate: null
};

const SETTINGS_KEY = 'this-life:fallback:settings';

export default function useSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      setSettings({ ...defaultSettings, ...(readLocal(SETTINGS_KEY, {}) || {}) });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('settings_app')
      .select('dream_version_description, countdown_start_date, last_visit_date')
      .eq('id', 'app')
      .maybeSingle();

    if (error) {
      setSettings({ ...defaultSettings, ...(readLocal(SETTINGS_KEY, {}) || {}) });
      setLoading(false);
      return;
    }

    if (data) {
      setSettings({
        dreamVersionDescription: data.dream_version_description || defaultSettings.dreamVersionDescription,
        countdownStartDate: data.countdown_start_date || defaultSettings.countdownStartDate,
        lastVisitDate: data.last_visit_date || null
      });
    } else {
      setSettings(defaultSettings);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSettings = useCallback(
    async (payload) => {
      const merged = { ...settings, ...payload };

      if (!isSupabaseConfigured) {
        const next = { ...defaultSettings, ...(readLocal(SETTINGS_KEY, {}) || {}), ...merged, updatedAt: new Date().toISOString() };
        writeLocal(SETTINGS_KEY, next);
        await refresh();
        return;
      }

      const { error } = await supabase.from('settings_app').upsert(
        {
          id: 'app',
          dream_version_description: merged.dreamVersionDescription,
          countdown_start_date: merged.countdownStartDate,
          last_visit_date: merged.lastVisitDate,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        const next = { ...defaultSettings, ...(readLocal(SETTINGS_KEY, {}) || {}), ...merged, updatedAt: new Date().toISOString() };
        writeLocal(SETTINGS_KEY, next);
      }

      await refresh();
    },
    [refresh, settings]
  );

  const setLastVisitDate = useCallback(
    async (dateKey) => {
      if (!isSupabaseConfigured) {
        const next = { ...defaultSettings, ...(readLocal(SETTINGS_KEY, {}) || {}), lastVisitDate: dateKey, updatedAt: new Date().toISOString() };
        writeLocal(SETTINGS_KEY, next);
        setSettings((prev) => ({ ...prev, lastVisitDate: dateKey }));
        return;
      }

      const { error } = await supabase.from('settings_app').upsert(
        {
          id: 'app',
          last_visit_date: dateKey,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      if (error) {
        const next = { ...defaultSettings, ...(readLocal(SETTINGS_KEY, {}) || {}), lastVisitDate: dateKey, updatedAt: new Date().toISOString() };
        writeLocal(SETTINGS_KEY, next);
      }

      setSettings((prev) => ({ ...prev, lastVisitDate: dateKey }));
    },
    []
  );

  const clearTodayData = useCallback(async () => {
    const dateKey = getDateKey();

    if (!isSupabaseConfigured) {
      removeLocal(`this-life:fallback:timetable:${dateKey}`);
      removeLocal(`this-life:fallback:protocol:${dateKey}`);
      const connections = readLocal('this-life:fallback:connections', {});
      delete connections[dateKey];
      writeLocal('this-life:fallback:connections', connections);
      return;
    }

    const [tRes, pRes, cRes] = await Promise.all([
      supabase.from('timetable_logs').delete().eq('date', dateKey),
      supabase.from('protocol_logs').delete().eq('date', dateKey),
      supabase.from('connections').delete().eq('date', dateKey)
    ]);

    if (tRes.error || pRes.error || cRes.error) {
      removeLocal(`this-life:fallback:timetable:${dateKey}`);
      removeLocal(`this-life:fallback:protocol:${dateKey}`);
      const connections = readLocal('this-life:fallback:connections', {});
      delete connections[dateKey];
      writeLocal('this-life:fallback:connections', connections);
    }
  }, []);

  const exportAllData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const fallbackExport = {
        settings: readLocal(SETTINGS_KEY, {}),
        work_schedule: readLocal('this-life:fallback:work_schedule', []),
        meetings_schedule: readLocal('this-life:fallback:meetings_schedule', []),
        ideas: readLocal('this-life:fallback:ideas', []),
        currentBrand: readLocal('this-life:fallback:brand:current', null),
        brands_pipeline: readLocal('this-life:fallback:brand:pipeline', []),
        brands_live: readLocal('this-life:fallback:brand:live', []),
        brands_archive: readLocal('this-life:fallback:brand:archive', []),
        connections: readLocal('this-life:fallback:connections', {}),
        planning_monthly: readLocal('this-life:fallback:planning:monthly', {}),
        planning_weekly: readLocal('this-life:fallback:planning:weekly', {}),
        planning_daily: readLocal('this-life:fallback:planning:daily', {})
      };

      const blob = new Blob([JSON.stringify(fallbackExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `this-life-export-${getDateKey()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const queries = await Promise.all([
      supabase.from('work_schedule').select('*'),
      supabase.from('meetings_schedule').select('*'),
      supabase.from('ideas').select('*'),
      supabase.from('brands_current').select('*').eq('id', 'current').maybeSingle(),
      supabase.from('brands_pipeline').select('*'),
      supabase.from('brands_live').select('*'),
      supabase.from('brands_archive').select('*'),
      supabase.from('connections').select('*'),
      supabase.from('planning_monthly').select('*'),
      supabase.from('planning_weekly').select('*'),
      supabase.from('planning_daily').select('*'),
      supabase.from('settings_app').select('*').eq('id', 'app').maybeSingle(),
      supabase.from('timetable_logs').select('*'),
      supabase.from('protocol_logs').select('*')
    ]);

    const exportData = {
      work_schedule: queries[0].data || [],
      meetings_schedule: queries[1].data || [],
      ideas: queries[2].data || [],
      currentBrand: queries[3].data?.data || null,
      brands_pipeline: queries[4].data || [],
      brands_live: queries[5].data || [],
      brands_archive: queries[6].data || [],
      connections: queries[7].data || [],
      planning_monthly: queries[8].data || [],
      planning_weekly: queries[9].data || [],
      planning_daily: queries[10].data || [],
      settings: queries[11].data || {},
      timetable_logs: queries[12].data || [],
      protocol_logs: queries[13].data || []
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `this-life-export-${getDateKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const readySettings = useMemo(() => ({ ...defaultSettings, ...settings }), [settings]);

  return {
    settings: readySettings,
    loading,
    refresh,
    updateSettings,
    setLastVisitDate,
    clearTodayData,
    exportAllData
  };
}
