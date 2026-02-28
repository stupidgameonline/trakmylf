import { useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import SectionCard from '../ui/SectionCard';
import useAnalyticsData from '../../hooks/useAnalyticsData';
import SkeletonBlock from '../ui/SkeletonBlock';

const colors = ['#f5a623', '#00e5ff', '#ff2d78', '#00ff88', '#ffd166', '#6ea8ff'];

function resolveRange(rangeType, customStart, customEnd) {
  const today = new Date();
  if (rangeType === 'today') return { start: today, end: today };
  if (rangeType === '7d') return { start: subDays(today, 6), end: today };
  if (rangeType === '30d') return { start: subDays(today, 29), end: today };
  return {
    start: customStart ? new Date(customStart) : subDays(today, 6),
    end: customEnd ? new Date(customEnd) : today
  };
}

function RangeButton({ active, onClick, children }) {
  return (
    <button className={`btn-soft !min-h-[36px] !px-3 text-xs ${active ? '!bg-accent !text-black' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function heatColor(value) {
  if (value === null || value === undefined) return 'bg-zinc-800';
  if (value === 100) return 'bg-green-500';
  if (value >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function DashboardPage() {
  const [rangeType, setRangeType] = useState('7d');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { start, end } = useMemo(() => resolveRange(rangeType, customStart, customEnd), [customEnd, customStart, rangeType]);

  const {
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
  } = useAnalyticsData(start, end);

  const brandKeys = useMemo(() => liveBrands.map((brand) => brand.name), [liveBrands]);

  const protocolPieData = useMemo(() => {
    const pass = protocolStackedData.reduce((sum, row) => sum + row.pass, 0);
    const fail = protocolStackedData.reduce((sum, row) => sum + row.fail, 0);
    return [
      { name: 'Pass', value: pass },
      { name: 'Fail', value: fail }
    ];
  }, [protocolStackedData]);

  const bestWeek = useMemo(() => {
    if (!weeklySummary.length) return null;
    return weeklySummary.reduce((best, item) => (item.avgCompletion > best.avgCompletion ? item : best), weeklySummary[0]);
  }, [weeklySummary]);

  const worstWeek = useMemo(() => {
    if (!weeklySummary.length) return null;
    return weeklySummary.reduce((worst, item) => (item.avgCompletion < worst.avgCompletion ? item : worst), weeklySummary[0]);
  }, [weeklySummary]);

  return (
    <div className="space-y-3">
      <SectionCard title="Dashboard Analytics" icon="📈" accent="#f5a623">
        <div className="mb-3 flex flex-wrap gap-2">
          <RangeButton active={rangeType === 'today'} onClick={() => setRangeType('today')}>
            Today
          </RangeButton>
          <RangeButton active={rangeType === '7d'} onClick={() => setRangeType('7d')}>
            Last 7 Days
          </RangeButton>
          <RangeButton active={rangeType === '30d'} onClick={() => setRangeType('30d')}>
            Last 30 Days
          </RangeButton>
          <RangeButton active={rangeType === 'custom'} onClick={() => setRangeType('custom')}>
            Custom
          </RangeButton>
        </div>

        {rangeType === 'custom' && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            <input className="input-dark" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
            <input className="input-dark" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
          </div>
        )}

        {loading ? (
          <SkeletonBlock className="h-44" />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="text-[11px] uppercase text-zinc-500">Average Completion</p>
              <p className="digital-font text-xl text-accent">{averageCompletion}%</p>
            </div>
            <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="text-[11px] uppercase text-zinc-500">Best Day</p>
              <p className="digital-font text-sm text-success">{bestDay ? `${bestDay.dateLabel} (${bestDay.completionPercent}%)` : 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="text-[11px] uppercase text-zinc-500">Best Streak</p>
              <p className="digital-font text-xl text-cyan-300">{streakInfo.bestStreak}</p>
            </div>
            <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="text-[11px] uppercase text-zinc-500">Current Streak</p>
              <p className="digital-font text-xl text-pink-300">{streakInfo.currentStreak}</p>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Timetable Performance" icon="⏰" accent="#f5a623">
        {loading ? (
          <SkeletonBlock className="h-56" />
        ) : (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <LineChart data={dailyRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="dateLabel" stroke="#888" />
                  <YAxis stroke="#888" domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completionPercent" stroke="#00e5ff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={dailyRows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="dateLabel" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="completeCount" fill="#f5a623" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-zinc-500">Heatmap</p>
              <div className="grid grid-cols-7 gap-1">
                {dailyRows.map((row) => (
                  <div
                    key={`heat-${row.dateKey}`}
                    className={`h-8 rounded ${heatColor(row.completionPercent)}`}
                    title={`${row.dateKey}: ${row.completionPercent}%`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="Protocol Performance" icon="🛡️" accent="#00e5ff">
        {loading ? (
          <SkeletonBlock className="h-56" />
        ) : (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={protocolStackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pass" stackId="a" fill="#00ff88" />
                  <Bar dataKey="fail" stackId="a" fill="#ff4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-borderSubtle">
              <table className="w-full min-w-[360px] text-left text-xs">
                <thead className="bg-cardAlt text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Pass</th>
                    <th className="px-3 py-2">Fail</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRows.map((row) => (
                    <tr key={`protocol-row-${row.dateKey}`} className="border-t border-borderSubtle">
                      <td className="px-3 py-2">{row.dateKey}</td>
                      <td className="px-3 py-2 text-green-300">{row.protocolPass}</td>
                      <td className="px-3 py-2 text-red-300">{row.protocolFail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 space-y-2">
              {protocolItemSeries.map((series) => (
                <div key={series.id}>
                  <p className="mb-1 text-[11px] uppercase text-zinc-500">{series.id.replaceAll('_', ' ')}</p>
                  <div className="flex flex-wrap gap-1">
                    {series.values.map((value) => (
                      <span
                        key={`${series.id}-${value.dateKey}`}
                        className={`h-2.5 w-2.5 rounded-full ${
                          value.status === 'passed'
                            ? 'bg-green-500'
                            : value.status === 'failed'
                              ? 'bg-red-500'
                              : value.status === 'na'
                                ? 'bg-zinc-500'
                                : 'border border-zinc-600'
                        }`}
                        title={`${value.dateKey}: ${value.status || 'no data'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="Brand Performance" icon="🚀" accent="#ff2d78">
        {loading ? (
          <SkeletonBlock className="h-48" />
        ) : (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <LineChart data={brandRevenueDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="dateKey" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Legend />
                  {brandKeys.map((key, idx) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={monthlyRevenueTotals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="brand" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#00ff88" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="mb-1 text-xs uppercase text-zinc-500">Current Brand Daily Logs</p>
              {currentBrand?.dailyLogs ? (
                <div className="space-y-1">
                  {Object.entries(currentBrand.dailyLogs)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([key, value]) => (
                      <p key={key} className="text-xs text-zinc-200">
                        {key}: {value.text}
                      </p>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No current brand log timeline yet.</p>
              )}
            </div>
          </>
        )}
      </SectionCard>

      {dailyRows.some((row) => row.connections > 0) && (
        <SectionCard title="Connections" icon="🤝" accent="#00e5ff">
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={dailyRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="dateLabel" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="connections" fill="#00e5ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-zinc-300">Running total: {dailyRows.reduce((sum, row) => sum + row.connections, 0)}</p>
        </SectionCard>
      )}

      <SectionCard title="Weekly Summary" icon="📅" accent="#ffd166">
        <div className="grid grid-cols-1 gap-2">
          <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3 text-xs text-zinc-200">
            Best Week: {bestWeek ? `${bestWeek.week} (${bestWeek.avgCompletion}% avg)` : 'N/A'}
          </div>
          <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3 text-xs text-zinc-200">
            Worst Week: {worstWeek ? `${worstWeek.week} (${worstWeek.avgCompletion}% avg)` : 'N/A'}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Monthly Summary" icon="🗓️" accent="#00ff88">
        {loading ? (
          <SkeletonBlock className="h-48" />
        ) : (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <AreaChart data={monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgCompletion" stroke="#f5a623" fill="#f5a62355" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={protocolPieData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8" label>
                    {protocolPieData.map((entry, idx) => (
                      <Cell key={`cell-${entry.name}`} fill={idx === 0 ? '#00ff88' : '#ff4444'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}

export default DashboardPage;
