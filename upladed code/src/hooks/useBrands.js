import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase';
import { readLocal, uid, writeLocal } from '../utils/localStore';
import { getDateKey, getMonthKey } from '../utils/date';

const LOCAL_KEYS = {
  current: 'this-life:fallback:brand:current',
  pipeline: 'this-life:fallback:brand:pipeline',
  live: 'this-life:fallback:brand:live',
  archive: 'this-life:fallback:brand:archive'
};

const defaultPhaseData = {
  phase1: { checklist: [], notes: '' },
  phase2: { checklist: [], tasks: [], notes: '' },
  phase3: {
    launchDate: '',
    distributionChannels: '',
    peopleAssigned: '',
    expectedMonthlyRevenue: '',
    recheckDate: '',
    expectedOutcome: ''
  }
};

const parseRevenueLog = (revenueLog = {}, monthKey = getMonthKey()) =>
  Object.entries(revenueLog).reduce((sum, [dateKey, amount]) => {
    if (dateKey.startsWith(monthKey)) {
      return sum + Number(amount || 0);
    }
    return sum;
  }, 0);

const mapPipeline = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  category: row.category || '',
  plannedStartDate: row.planned_start_date || '',
  sourceIdea: row.source_idea || '',
  order: Number(row.sort_order || 0),
  createdAt: row.created_at
});

const mapLive = (row) => ({
  id: row.id,
  name: row.name,
  startDate: row.start_date || '',
  revenueLog: row.revenue_log || {},
  status: row.status || 'active',
  phase: row.phase || null,
  source: row.source || null,
  createdAt: row.created_at
});

const mapArchive = (row) => ({
  id: row.id,
  name: row.name,
  reason: row.reason || '',
  closedDate: row.closed_date || '',
  totalRevenue: Number(row.total_revenue || 0),
  summary: row.summary || '',
  createdAt: row.created_at
});

export default function useBrands() {
  const [loading, setLoading] = useState(true);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [pipelineBrands, setPipelineBrands] = useState([]);
  const [liveBrands, setLiveBrands] = useState([]);
  const [archiveBrands, setArchiveBrands] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      setCurrentBrand(readLocal(LOCAL_KEYS.current, null));
      setPipelineBrands(readLocal(LOCAL_KEYS.pipeline, []).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)));
      setLiveBrands(readLocal(LOCAL_KEYS.live, []));
      setArchiveBrands(readLocal(LOCAL_KEYS.archive, []));
      setLoading(false);
      return;
    }

    const [currentRes, pipelineRes, liveRes, archiveRes] = await Promise.all([
      supabase.from('brands_current').select('data').eq('id', 'current').maybeSingle(),
      supabase.from('brands_pipeline').select('*').order('sort_order', { ascending: true }),
      supabase.from('brands_live').select('*'),
      supabase.from('brands_archive').select('*')
    ]);

    if (currentRes.error || pipelineRes.error || liveRes.error || archiveRes.error) {
      setCurrentBrand(readLocal(LOCAL_KEYS.current, null));
      setPipelineBrands(readLocal(LOCAL_KEYS.pipeline, []).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)));
      setLiveBrands(readLocal(LOCAL_KEYS.live, []));
      setArchiveBrands(readLocal(LOCAL_KEYS.archive, []));
      setLoading(false);
      return;
    }

    setCurrentBrand(currentRes.data?.data || null);
    setPipelineBrands((pipelineRes.data || []).map(mapPipeline));
    setLiveBrands((liveRes.data || []).map(mapLive));
    setArchiveBrands((archiveRes.data || []).map(mapArchive));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveCurrentBrand = useCallback(
    async (payload) => {
      if (!isSupabaseConfigured) {
        const current = {
          phase: 1,
          phaseData: defaultPhaseData,
          dailyLogs: {},
          startDate: getDateKey(),
          ...payload,
          updatedAt: new Date().toISOString()
        };
        writeLocal(LOCAL_KEYS.current, current);
        await refresh();
        return;
      }

      const next = {
        phase: 1,
        phaseData: defaultPhaseData,
        dailyLogs: {},
        startDate: getDateKey(),
        ...payload,
        updatedAt: new Date().toISOString()
      };

      await supabase.from('brands_current').upsert(
        {
          id: 'current',
          data: next,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

      await refresh();
    },
    [refresh]
  );

  const updateCurrentBrand = useCallback(
    async (payload) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(LOCAL_KEYS.current, null) || {};
        writeLocal(LOCAL_KEYS.current, { ...current, ...payload, updatedAt: new Date().toISOString() });
        await refresh();
        return;
      }

      const { data: row } = await supabase.from('brands_current').select('data').eq('id', 'current').maybeSingle();
      const currentData = row?.data || {};
      const next = { ...currentData, ...payload, updatedAt: new Date().toISOString() };

      await supabase.from('brands_current').upsert(
        {
          id: 'current',
          data: next,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

      await refresh();
    },
    [refresh]
  );

  const addCurrentBrandLog = useCallback(
    async (text, dateKey = getDateKey()) => {
      if (!text?.trim()) return;

      if (!isSupabaseConfigured) {
        const current = readLocal(LOCAL_KEYS.current, null);
        if (!current) return;
        const next = {
          ...current,
          dailyLogs: {
            ...(current.dailyLogs || {}),
            [dateKey]: {
              text: text.trim(),
              timestamp: new Date().toISOString()
            }
          }
        };
        writeLocal(LOCAL_KEYS.current, next);
        await refresh();
        return;
      }

      const { data: row } = await supabase.from('brands_current').select('data').eq('id', 'current').maybeSingle();
      const currentData = row?.data || null;
      if (!currentData) return;

      const next = {
        ...currentData,
        dailyLogs: {
          ...(currentData.dailyLogs || {}),
          [dateKey]: {
            text: text.trim(),
            timestamp: new Date().toISOString()
          }
        }
      };

      await supabase.from('brands_current').upsert(
        {
          id: 'current',
          data: next,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

      await refresh();
    },
    [refresh]
  );

  const markAutomated = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const current = readLocal(LOCAL_KEYS.current, null);
      if (!current) return;

      const live = readLocal(LOCAL_KEYS.live, []);
      live.push({
        id: uid('live_brand'),
        name: current.name,
        startDate: getDateKey(),
        revenueLog: {},
        status: 'active',
        phase: 3,
        source: 'current_brand_transition',
        createdAt: new Date().toISOString()
      });
      writeLocal(LOCAL_KEYS.live, live);
      writeLocal(LOCAL_KEYS.current, null);
      await refresh();
      return;
    }

    const { data: currentRow } = await supabase.from('brands_current').select('data').eq('id', 'current').maybeSingle();
    const current = currentRow?.data;
    if (!current?.name) return;

    await supabase.from('brands_live').insert({
      name: current.name,
      start_date: getDateKey(),
      revenue_log: {},
      status: 'active',
      phase: 3,
      source: 'current_brand_transition',
      created_at: new Date().toISOString()
    });

    await supabase.from('brands_current').delete().eq('id', 'current');
    await refresh();
  }, [refresh]);

  const addPipelineBrand = useCallback(
    async (payload) => {
      const nextOrder = pipelineBrands.length ? Math.max(...pipelineBrands.map((brand) => Number(brand.order || 0))) + 1 : 1;

      if (!isSupabaseConfigured) {
        const pipeline = readLocal(LOCAL_KEYS.pipeline, []);
        pipeline.push({
          id: uid('pipeline_brand'),
          ...payload,
          order: nextOrder,
          createdAt: new Date().toISOString()
        });
        writeLocal(LOCAL_KEYS.pipeline, pipeline);
        await refresh();
        return;
      }

      await supabase.from('brands_pipeline').insert({
        name: payload.name,
        description: payload.description || '',
        category: payload.category || '',
        planned_start_date: payload.plannedStartDate || '',
        source_idea: payload.sourceIdea || '',
        sort_order: nextOrder,
        created_at: new Date().toISOString()
      });

      await refresh();
    },
    [pipelineBrands, refresh]
  );

  const reorderPipelineBrand = useCallback(
    async (id, direction) => {
      const index = pipelineBrands.findIndex((brand) => brand.id === id);
      if (index < 0) return;

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= pipelineBrands.length) return;

      const source = pipelineBrands[index];
      const target = pipelineBrands[swapIndex];

      if (!isSupabaseConfigured) {
        const pipeline = [...pipelineBrands];
        pipeline[index] = { ...source, order: target.order };
        pipeline[swapIndex] = { ...target, order: source.order };
        writeLocal(LOCAL_KEYS.pipeline, pipeline);
        await refresh();
        return;
      }

      await Promise.all([
        supabase.from('brands_pipeline').update({ sort_order: target.order }).eq('id', source.id),
        supabase.from('brands_pipeline').update({ sort_order: source.order }).eq('id', target.id)
      ]);

      await refresh();
    },
    [pipelineBrands, refresh]
  );

  const setPipelineAsCurrent = useCallback(
    async (id) => {
      if (currentBrand?.name) return false;
      const brand = pipelineBrands.find((item) => item.id === id);
      if (!brand) return false;

      const currentData = {
        name: brand.name,
        phase: 1,
        phaseData: defaultPhaseData,
        dailyLogs: {},
        startDate: getDateKey(),
        category: brand.category || '',
        description: brand.description || '',
        plannedStartDate: brand.plannedStartDate || '',
        sourceIdea: brand.sourceIdea || ''
      };

      if (!isSupabaseConfigured) {
        writeLocal(LOCAL_KEYS.current, currentData);
        writeLocal(
          LOCAL_KEYS.pipeline,
          pipelineBrands.filter((item) => item.id !== id)
        );
        await refresh();
        return true;
      }

      await supabase.from('brands_current').upsert(
        {
          id: 'current',
          data: currentData,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

      await supabase.from('brands_pipeline').delete().eq('id', id);
      await refresh();
      return true;
    },
    [currentBrand?.name, pipelineBrands, refresh]
  );

  const logRevenue = useCallback(
    async (brandId, amount, dateKey = getDateKey()) => {
      if (!isSupabaseConfigured) {
        const live = readLocal(LOCAL_KEYS.live, []);
        writeLocal(
          LOCAL_KEYS.live,
          live.map((brand) =>
            brand.id === brandId
              ? {
                  ...brand,
                  revenueLog: {
                    ...(brand.revenueLog || {}),
                    [dateKey]: Number(amount || 0)
                  }
                }
              : brand
          )
        );
        await refresh();
        return;
      }

      const { data: row } = await supabase.from('brands_live').select('revenue_log').eq('id', brandId).maybeSingle();
      const revenueLog = {
        ...(row?.revenue_log || {}),
        [dateKey]: Number(amount || 0)
      };

      await supabase.from('brands_live').update({ revenue_log: revenueLog }).eq('id', brandId);
      await refresh();
    },
    [refresh]
  );

  const addLiveBrand = useCallback(
    async (payload) => {
      if (!isSupabaseConfigured) {
        const live = readLocal(LOCAL_KEYS.live, []);
        live.push({
          id: uid('live_brand'),
          ...payload,
          startDate: payload.startDate || getDateKey(),
          status: 'active',
          revenueLog: {},
          createdAt: new Date().toISOString()
        });
        writeLocal(LOCAL_KEYS.live, live);
        await refresh();
        return;
      }

      await supabase.from('brands_live').insert({
        name: payload.name,
        start_date: payload.startDate || getDateKey(),
        status: 'active',
        revenue_log: {},
        created_at: new Date().toISOString()
      });
      await refresh();
    },
    [refresh]
  );

  const closeLiveBrand = useCallback(
    async (brandId, reason = "didn't work out") => {
      const target = liveBrands.find((brand) => brand.id === brandId);
      if (!target) return;

      const totalRevenue = Object.values(target.revenueLog || {}).reduce((sum, value) => sum + Number(value || 0), 0);

      if (!isSupabaseConfigured) {
        const live = readLocal(LOCAL_KEYS.live, []);
        const archive = readLocal(LOCAL_KEYS.archive, []);
        archive.push({
          id: uid('archive_brand'),
          name: target.name,
          reason,
          closedDate: getDateKey(),
          totalRevenue,
          summary: `${target.name} closed after active run.`
        });
        writeLocal(LOCAL_KEYS.archive, archive);
        writeLocal(
          LOCAL_KEYS.live,
          live.filter((brand) => brand.id !== brandId)
        );
        await refresh();
        return;
      }

      await supabase.from('brands_archive').insert({
        name: target.name,
        reason,
        closed_date: getDateKey(),
        total_revenue: totalRevenue,
        summary: `${target.name} closed after active run.`,
        created_at: new Date().toISOString()
      });

      await supabase.from('brands_live').delete().eq('id', brandId);
      await refresh();
    },
    [liveBrands, refresh]
  );

  const updatePipelineBrand = useCallback(
    async (id, payload) => {
      if (!isSupabaseConfigured) {
        writeLocal(
          LOCAL_KEYS.pipeline,
          pipelineBrands.map((brand) => (brand.id === id ? { ...brand, ...payload } : brand))
        );
        await refresh();
        return;
      }

      await supabase
        .from('brands_pipeline')
        .update({
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.description !== undefined ? { description: payload.description } : {}),
          ...(payload.category !== undefined ? { category: payload.category } : {}),
          ...(payload.plannedStartDate !== undefined ? { planned_start_date: payload.plannedStartDate } : {}),
          ...(payload.sourceIdea !== undefined ? { source_idea: payload.sourceIdea } : {}),
          ...(payload.order !== undefined ? { sort_order: Number(payload.order) } : {})
        })
        .eq('id', id);

      await refresh();
    },
    [pipelineBrands, refresh]
  );

  const deletePipelineBrand = useCallback(
    async (id) => {
      if (!isSupabaseConfigured) {
        writeLocal(
          LOCAL_KEYS.pipeline,
          pipelineBrands.filter((brand) => brand.id !== id)
        );
        await refresh();
        return;
      }

      await supabase.from('brands_pipeline').delete().eq('id', id);
      await refresh();
    },
    [pipelineBrands, refresh]
  );

  const monthlyRevenueByLiveBrand = useMemo(
    () =>
      liveBrands.map((brand) => ({
        ...brand,
        monthlyRevenue: parseRevenueLog(brand.revenueLog)
      })),
    [liveBrands]
  );

  return {
    loading,
    currentBrand,
    pipelineBrands,
    liveBrands,
    archiveBrands,
    monthlyRevenueByLiveBrand,
    saveCurrentBrand,
    updateCurrentBrand,
    addCurrentBrandLog,
    markAutomated,
    addPipelineBrand,
    updatePipelineBrand,
    reorderPipelineBrand,
    setPipelineAsCurrent,
    deletePipelineBrand,
    addLiveBrand,
    logRevenue,
    closeLiveBrand,
    refresh
  };
}
