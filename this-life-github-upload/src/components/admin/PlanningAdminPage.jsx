import { addMonths, addWeeks, format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import SectionCard from '../ui/SectionCard';
import usePlanning from '../../hooks/usePlanning';
import { getDateKey, getMonthKey, getWeekKey } from '../../utils/date';

const toLines = (value) => (Array.isArray(value) ? value.join('\n') : value || '');
const fromLines = (value) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

function PlanningAdminPage() {
  const planning = usePlanning();
  const now = new Date();

  const currentMonthKey = getMonthKey(now);
  const nextMonthKey = getMonthKey(addMonths(now, 1));
  const currentWeekKey = getWeekKey(now);
  const nextWeekKey = getWeekKey(addWeeks(now, 1));

  const nextMonthUnlocked = now.getDate() >= 25;
  const weekday = now.getDay();
  const nextWeekUnlocked = weekday === 5 || weekday === 6 || weekday === 0;

  const [monthlyCurrent, setMonthlyCurrent] = useState({ notes: '', goalsText: '' });
  const [monthlyNext, setMonthlyNext] = useState({ notes: '', goalsText: '' });
  const [weeklyCurrent, setWeeklyCurrent] = useState({ notes: '', goalsText: '' });
  const [weeklyNext, setWeeklyNext] = useState({ notes: '', goalsText: '' });
  const [dailyDate, setDailyDate] = useState(getDateKey());
  const [dailyNotes, setDailyNotes] = useState('');
  const [dailyGoalsText, setDailyGoalsText] = useState('');

  useEffect(() => {
    const run = async () => {
      const [monthCurrentData, monthNextData, weekCurrentData, weekNextData, dailyData] = await Promise.all([
        planning.getMonthly(currentMonthKey),
        planning.getMonthly(nextMonthKey),
        planning.getWeekly(currentWeekKey),
        planning.getWeekly(nextWeekKey),
        planning.getDaily(dailyDate)
      ]);

      setMonthlyCurrent({ notes: monthCurrentData.notes || '', goalsText: toLines(monthCurrentData.goals) });
      setMonthlyNext({ notes: monthNextData.notes || '', goalsText: toLines(monthNextData.goals) });
      setWeeklyCurrent({ notes: weekCurrentData.notes || '', goalsText: toLines(weekCurrentData.goals) });
      setWeeklyNext({ notes: weekNextData.notes || '', goalsText: toLines(weekNextData.goals) });
      setDailyNotes(dailyData.notes || '');
      setDailyGoalsText(toLines(dailyData.goals));
    };

    run();
  }, [currentMonthKey, currentWeekKey, dailyDate, nextMonthKey, nextWeekKey, planning]);

  const nextMonthUnlockText = useMemo(() => `Unlocks on ${format(new Date(now.getFullYear(), now.getMonth(), 25), 'MMMM do')}`, [now]);
  const nextWeekUnlockText = useMemo(() => 'Unlocks on Friday', []);

  return (
    <div className="space-y-3">
      <SectionCard title="Monthly Goals" icon="🗓️" accent="#f5a623">
        <div className="space-y-3">
          <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
            <p className="mb-2 text-xs uppercase text-zinc-500">Current Month ({currentMonthKey})</p>
            <textarea
              className="textarea-dark"
              placeholder="Monthly notes"
              value={monthlyCurrent.notes}
              onChange={(event) => setMonthlyCurrent((prev) => ({ ...prev, notes: event.target.value }))}
            />
            <textarea
              className="textarea-dark mt-2"
              placeholder="One goal per line"
              value={monthlyCurrent.goalsText}
              onChange={(event) => setMonthlyCurrent((prev) => ({ ...prev, goalsText: event.target.value }))}
            />
            <button
              className="btn-primary mt-2 w-full"
              onClick={() => planning.saveMonthly(currentMonthKey, { notes: monthlyCurrent.notes, goals: fromLines(monthlyCurrent.goalsText) })}
            >
              Save Current Month
            </button>
          </div>

          <div className={`rounded-xl border p-3 ${nextMonthUnlocked ? 'border-borderSubtle bg-cardAlt' : 'border-zinc-700 bg-zinc-900/80'}`}>
            <p className="mb-2 text-xs uppercase text-zinc-500">Next Month ({nextMonthKey})</p>
            {nextMonthUnlocked ? (
              <>
                <textarea
                  className="textarea-dark"
                  placeholder="Next month notes"
                  value={monthlyNext.notes}
                  onChange={(event) => setMonthlyNext((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <textarea
                  className="textarea-dark mt-2"
                  placeholder="One goal per line"
                  value={monthlyNext.goalsText}
                  onChange={(event) => setMonthlyNext((prev) => ({ ...prev, goalsText: event.target.value }))}
                />
                <button
                  className="btn-primary mt-2 w-full"
                  onClick={() => planning.saveMonthly(nextMonthKey, { notes: monthlyNext.notes, goals: fromLines(monthlyNext.goalsText) })}
                >
                  Save Next Month
                </button>
              </>
            ) : (
              <p className="text-xs text-zinc-500">🔒 {nextMonthUnlockText}</p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Weekly Goals" icon="📆" accent="#00e5ff">
        <div className="space-y-3">
          <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
            <p className="mb-2 text-xs uppercase text-zinc-500">Current Week ({currentWeekKey})</p>
            <textarea
              className="textarea-dark"
              placeholder="Weekly goals (one per line)"
              value={weeklyCurrent.goalsText}
              onChange={(event) => setWeeklyCurrent((prev) => ({ ...prev, goalsText: event.target.value }))}
            />
            <button
              className="btn-primary mt-2 w-full"
              onClick={() => planning.saveWeekly(currentWeekKey, { goals: fromLines(weeklyCurrent.goalsText), notes: weeklyCurrent.notes })}
            >
              Save Current Week
            </button>
          </div>

          <div className={`rounded-xl border p-3 ${nextWeekUnlocked ? 'border-borderSubtle bg-cardAlt' : 'border-zinc-700 bg-zinc-900/80'}`}>
            <p className="mb-2 text-xs uppercase text-zinc-500">Next Week ({nextWeekKey})</p>
            {nextWeekUnlocked ? (
              <>
                <textarea
                  className="textarea-dark"
                  placeholder="Next week goals (one per line)"
                  value={weeklyNext.goalsText}
                  onChange={(event) => setWeeklyNext((prev) => ({ ...prev, goalsText: event.target.value }))}
                />
                <button
                  className="btn-primary mt-2 w-full"
                  onClick={() => planning.saveWeekly(nextWeekKey, { goals: fromLines(weeklyNext.goalsText), notes: weeklyNext.notes })}
                >
                  Save Next Week
                </button>
              </>
            ) : (
              <p className="text-xs text-zinc-500">🔒 {nextWeekUnlockText}</p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Daily Goals" icon="🎯" accent="#00ff88">
        <input className="input-dark mb-2" type="date" value={dailyDate} onChange={(event) => setDailyDate(event.target.value)} />
        <textarea className="textarea-dark" placeholder="Daily notes" value={dailyNotes} onChange={(event) => setDailyNotes(event.target.value)} />
        <textarea
          className="textarea-dark mt-2"
          placeholder="One daily goal per line"
          value={dailyGoalsText}
          onChange={(event) => setDailyGoalsText(event.target.value)}
        />
        <button
          className="btn-primary mt-2 w-full"
          onClick={() => planning.saveDaily(dailyDate, { notes: dailyNotes, goals: fromLines(dailyGoalsText) })}
        >
          Save Daily Plan
        </button>
      </SectionCard>
    </div>
  );
}

export default PlanningAdminPage;
