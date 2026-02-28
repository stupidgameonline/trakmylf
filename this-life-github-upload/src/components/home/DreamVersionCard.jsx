import { differenceInCalendarDays, parseISO, subDays } from 'date-fns';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SectionCard from '../ui/SectionCard';
import ProgressBar from '../ui/ProgressBar';
import { getDateKey } from '../../utils/date';
import { getBaseTimetableForDate } from '../../data/timetable';
import { fetchTimetableRange } from '../../hooks/useTimetableLogs';
import { readLocal, writeLocal } from '../../utils/localStore';

const getCacheKey = (dateKey) => `this-life:dream-progress:${dateKey}`;

function DreamVersionCard({ settings, onSaveDescription }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState(settings.dreamVersionDescription || '');
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setText(settings.dreamVersionDescription || '');
  }, [settings.dreamVersionDescription]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const today = new Date();
      const todayKey = getDateKey(today);
      const cached = readLocal(getCacheKey(todayKey), null);
      if (cached?.daysCompleted !== undefined) {
        if (mounted) {
          setDaysCompleted(Number(cached.daysCompleted || 0));
          setLoading(false);
        }
        return;
      }

      const startDate = subDays(today, 364);
      const logsByDate = await fetchTimetableRange(startDate, today);

      let done = 0;
      for (let i = 0; i < 365; i += 1) {
        const target = subDays(today, i);
        const dateKey = getDateKey(target);
        const expected = getBaseTimetableForDate(target).filter((task) => !task.optional);
        if (!expected.length) continue;

        const logs = logsByDate[dateKey] || {};
        const allDone = expected.every((task) => logs[task.id]?.status === 'complete');
        if (allDone) done += 1;
      }

      if (mounted) {
        setDaysCompleted(done);
        writeLocal(getCacheKey(todayKey), { daysCompleted: done, updatedAt: today.toISOString() });
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [settings.countdownStartDate]);

  const daysRemaining = useMemo(() => {
    const start = settings.countdownStartDate ? parseISO(settings.countdownStartDate) : new Date();
    const elapsed = differenceInCalendarDays(new Date(), start);
    return Math.max(365 - Math.max(elapsed, 0), 0);
  }, [settings.countdownStartDate]);

  const progress = useMemo(() => Math.min(100, Math.round((daysCompleted / 365) * 100)), [daysCompleted]);

  return (
    <>
      <SectionCard
        title="DREAM VERSION"
        icon="🎯"
        accent="#f5a623"
        rightSlot={
          <button className="btn-soft !min-h-[32px] !px-2 text-[10px]" onClick={() => setIsModalOpen(true)}>
            <Sparkles className="h-4 w-4 text-accent" />
          </button>
        }
      >
        <p className="mb-2 text-xs text-zinc-400">{settings.dreamVersionDescription}</p>
        <div className="mb-2 bg-gradient-to-r from-accent via-accentAlt to-success bg-clip-text text-center text-6xl font-black text-transparent">
          {daysRemaining}
        </div>
        <p className="mb-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-400">DAYS TO YOUR DREAM VERSION</p>
        <ProgressBar value={progress} color="linear-gradient(90deg,#f5a623,#ff2d78,#00ff88)" />
        <p className="mt-2 text-center text-xs text-zinc-200">🚀 Every working day brings you ONE step closer!</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-borderSubtle bg-cardAlt p-2 text-center">
            <p className="text-[0.65rem] uppercase text-zinc-500">Days Completed</p>
            <p className="digital-font text-lg font-bold text-success">{loading ? '...' : daysCompleted}</p>
          </div>
          <div className="rounded-lg border border-borderSubtle bg-cardAlt p-2 text-center">
            <p className="text-[0.65rem] uppercase text-zinc-500">Days Remaining</p>
            <p className="digital-font text-lg font-bold text-accent">{daysRemaining}</p>
          </div>
        </div>
      </SectionCard>

      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[420px] rounded-2xl border border-accent/30 bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="title-font text-sm uppercase text-accent">Dream Version Description</h3>
              <button className="btn-soft !min-h-[32px] !px-2" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              className="textarea-dark"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Describe the person you are becoming..."
            />
            <button
              className="btn-primary mt-3 w-full"
              onClick={async () => {
                await onSaveDescription(text.trim());
                setIsModalOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DreamVersionCard;
