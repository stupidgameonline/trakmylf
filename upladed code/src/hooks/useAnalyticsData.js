import { useEffect, useMemo, useState } from 'react';
import { endOfDay, format, parseISO } from 'date-fns';
import { isSupabaseConfigured, supabase } from '../supabase';
import { getBaseTimetableForDate } from '../data/timetable';
import { getCurrentZone, getDateKey, getDateRange, getDayType, getMonthKey, getWeekKey } from '../utils/date';
import { fetchProtocolRange } from './useProtocolLogs';
import { fetchTimetableRange } from './useTimetableLogs';
import { getProtocolItems as getProtocolItemsForContext } from '../data/protocol';
import { readLocal } from '../utils/localStore';

const statusToBinary = (status) => {
  if (status === 'passed') return 1;
  if (status === 'failed') return 0;
  return null;
};

const groupBy = (list, keyGetter) =>
  list.reduce((acc, item) => {
    const key = keyGetter(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

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

export default function useAnalyticsData(startDate, endDate) {
  const [loading, setLoading] = useState(true);
  const [dailyRows, setDailyRows] = useState([]);
  const [liveBrands, setLiveBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        const rangeDates = getDateRange(startDate, endDate);
        const dateKeys = rangeDates.map((d) => getDateKey(d));

        const timetableRange = await fetchTimetableRange(startDate, endDate);
        const protocolRange = await fetchProtocolRange(startDate, endDate);

        let connectionsMap = {};
        let live = [];
        let current = null;

        if (!isSupabaseConfigured) {
          connectionsMap = readLocal('this-life:fallback:connections', {});
          live = readLocal('this-life:fallback:brand:live', []);
          current = readLocal('this-life:fallback:brand:current', null);
        } else {
          const [connectionsRes, liveRes, currentRes] = await Promise.all([
            supabase.from('connections').select('date, count').in('date', dateKeys),
            supabase.from('brands_live').select('*'),
            supabase.from('brands_current').select('data').eq('id', 'current').maybeSingle()
          ]);

          if (connectionsRes.error || liveRes.error || currentRes.error) {
            connectionsMap = readLocal('this-life:fallback:connections', {});
            live = readLocal('this-life:fallback:brand:live', []);
            current = readLocal('this-life:fallback:brand:current', null);
          } else {
            (connectionsRes.data || []).forEach((row) => {
              connectionsMap[row.date] = { count: Number(row.count || 0) };
            });

            live = (liveRes.data || []).map(mapLive);
            current = currentRes.data?.data || null;
          }
        }

        const rows = rangeDates.map((date) => {
          const dateKey = getDateKey(date);
          const dayType = getDayType(date);
          const zone = getCurrentZone(date);
          const expectedTasks = getBaseTimetableForDate(date).filter((task) => !task.optional);
          const taskLogs = timetableRange[dateKey] || {};

          const completeCount = expectedTasks.filter((task) => taskLogs[task.id]?.status === 'complete').length;
          const completionPercent = expectedTasks.length ? Math.round((completeCount / expectedTasks.length) * 100) : 0;

          const protocolItems = getProtocolItemsForContext(zone, dayType);
          const protocolLogs = protocolRange[dateKey] || {};
          const protocolPass = protocolItems.filter((item) => protocolLogs[item.id]?.status === 'passed').length;
          const protocolFail = protocolItems.filter((item) => protocolLogs[item.id]?.status === 'failed').length;

          return {
            dateKey,
            dateLabel: format(date, 'MMM do'),
            completionPercent,
            completeCount,
            totalTasks: expectedTasks.length,
            protocolPass,
            protocolFail,
            protocolLogs,
            zone,
            dayType,
            connections: Number(connectionsMap[dateKey]?.count || 0)
          };
        });

        if (!mounted) return;
        setDailyRows(rows);
        setLiveBrands(live);
        setCurrentBrand(current);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [startDate, endDate]);

  const bestDay = useMemo(() => {
    if (!dailyRows.length) return null;
    return dailyRows.reduce((best, row) => (row.completionPercent > best.completionPercent ? row : best), dailyRows[0]);
  }, [dailyRows]);

  const averageCompletion = useMemo(() => {
    if (!dailyRows.length) return 0;
    return Math.round(dailyRows.reduce((sum, row) => sum + row.completionPercent, 0) / dailyRows.length);
  }, [dailyRows]);

  const streakInfo = useMemo(() => {
    if (!dailyRows.length) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    let currentStreak = 0;
    let bestStreak = 0;
    let running = 0;

    [...dailyRows].forEach((row) => {
      if (row.completionPercent === 100) {
        running += 1;
        bestStreak = Math.max(bestStreak, running);
      } else {
        running = 0;
      }
    });

    for (let i = dailyRows.length - 1; i >= 0; i -= 1) {
      if (dailyRows[i].completionPercent === 100) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    return { currentStreak, bestStreak };
  }, [dailyRows]);

  const protocolStackedData = useMemo(
    () =>
      dailyRows.map((row) => ({
        date: row.dateLabel,
        pass: row.protocolPass,
        fail: row.protocolFail
      })),
    [dailyRows]
  );

  const protocolItemSeries = useMemo(() => {
    const ids = ['no_fap', 'no_sugar', 'no_phone', 'headspace', 'completed_tasks', 'worked_out'];
    return ids.map((id) => ({
      id,
      values: dailyRows.map((row) => ({
        dateKey: row.dateKey,
        status: row.protocolLogs[id]?.status || null,
        binary: statusToBinary(row.protocolLogs[id]?.status || null)
      }))
    }));
  }, [dailyRows]);

  const brandRevenueDaily = useMemo(() => {
    const map = {};
    liveBrands.forEach((brand) => {
      Object.entries(brand.revenueLog || {}).forEach(([dateKey, amount]) => {
        if (!map[dateKey]) map[dateKey] = { dateKey };
        map[dateKey][brand.name] = Number(amount || 0);
      });
    });

    return Object.values(map)
      .filter((row) => {
        const date = parseISO(row.dateKey);
        return date >= startDate && date <= endOfDay(endDate);
      })
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [endDate, liveBrands, startDate]);

  const monthlyRevenueTotals = useMemo(() => {
    return liveBrands.map((brand) => {
      const totalsByMonth = {};
      Object.entries(brand.revenueLog || {}).forEach(([dateKey, amount]) => {
        const monthKey = getMonthKey(parseISO(dateKey));
        totalsByMonth[monthKey] = Number(totalsByMonth[monthKey] || 0) + Number(amount || 0);
      });

      const total = Object.values(totalsByMonth).reduce((sum, value) => sum + value, 0);
      return {
        brand: brand.name,
        total
      };
    });
  }, [liveBrands]);

  const weeklySummary = useMemo(() => {
    const grouped = groupBy(dailyRows, (row) => getWeekKey(parseISO(row.dateKey)));

    return Object.entries(grouped).map(([week, rows]) => ({
      week,
      avgCompletion: Math.round(rows.reduce((sum, row) => sum + row.completionPercent, 0) / rows.length),
      totalConnections: rows.reduce((sum, row) => sum + row.connections, 0)
    }));
  }, [dailyRows]);

  const monthlySummary = useMemo(() => {
    const grouped = groupBy(dailyRows, (row) => row.dateKey.slice(0, 7));
    return Object.entries(grouped).map(([month, rows]) => ({
      month,
      avgCompletion: Math.round(rows.reduce((sum, row) => sum + row.completionPercent, 0) / rows.length),
      protocolPassRate: (() => {
        const pass = rows.reduce((sum, row) => sum + row.protocolPass, 0);
        const total = rows.reduce((sum, row) => sum + row.protocolPass + row.protocolFail, 0);
        return total ? Math.round((pass / total) * 100) : 0;
      })()
    }));
  }, [dailyRows]);

  return {
    loading,
    dailyRows,
    bestDay,
    averageCompletion,
    streakInfo,
    protocolStackedData,
    protocolItemSeries,
    liveBrands,
    currentBrand,
    brandRevenueDaily,
    monthlyRevenueTotals,
    weeklySummary,
    monthlySummary
  };
}
