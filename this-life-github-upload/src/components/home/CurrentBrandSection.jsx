import { useMemo, useState } from 'react';
import { getDateKey } from '../../utils/date';
import SectionCard from '../ui/SectionCard';
import ProgressBar from '../ui/ProgressBar';

const phaseMap = {
  1: 'Phase 1: Research',
  2: 'Phase 2: Build',
  3: 'Phase 3: Execute'
};

function calculatePhaseProgress(currentBrand) {
  if (!currentBrand) return 0;
  if (currentBrand.phase === 3) return 100;

  const section = currentBrand.phase === 1 ? currentBrand.phaseData?.phase1 : currentBrand.phaseData?.phase2;
  const checklist = section?.checklist || [];
  if (!checklist.length) return Math.round((currentBrand.phase / 3) * 100);

  const done = checklist.filter((item) => item.done).length;
  return Math.round((done / checklist.length) * 100);
}

function CurrentBrandSection({ currentBrand, addCurrentBrandLog, markAutomated }) {
  const [logText, setLogText] = useState('');
  const dateKey = getDateKey();

  const progress = useMemo(() => calculatePhaseProgress(currentBrand), [currentBrand]);

  if (!currentBrand?.name) {
    return (
      <SectionCard title="CURRENT BRAND" icon="🚀" accent="#ff2d78">
        <p className="text-xs italic text-zinc-500">No active brand. Add from admin panel.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="CURRENT BRAND" icon="🚀" accent="#ff2d78">
      <p className="mb-1 text-sm text-zinc-300">Work on only 1 brand at a time. Once fully automated, move to Live Brands.</p>

      <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3">
        <p className="title-font text-lg font-bold uppercase text-pink-200">{currentBrand.name}</p>
        <span className="badge mt-1 inline-block bg-pink-500/20 text-pink-200">{phaseMap[currentBrand.phase] || phaseMap[1]}</span>
        <div className="mt-2">
          <ProgressBar value={progress} color="linear-gradient(90deg,#ff2d78,#f5a623)" />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
        What did you do today to automate {currentBrand.name}?
      </div>

      <textarea
        className="textarea-dark mt-3"
        placeholder="Log your update for today..."
        value={logText}
        onChange={(event) => setLogText(event.target.value)}
      />

      <button
        className="btn-primary mt-2 w-full"
        onClick={async () => {
          if (!logText.trim()) return;
          await addCurrentBrandLog(logText.trim());
          setLogText('');
        }}
      >
        Save
      </button>

      {currentBrand.dailyLogs?.[dateKey]?.text && (
        <div className="mt-3 rounded-xl border border-borderSubtle bg-cardAlt p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Today's Log</p>
          <p className="mt-1 text-sm text-zinc-100">{currentBrand.dailyLogs?.[dateKey]?.text}</p>
        </div>
      )}

      <button
        className="btn-danger mt-3 w-full"
        onClick={async () => {
          if (!window.confirm('Move current brand to live brands and clear current slot?')) return;
          await markAutomated();
        }}
      >
        Brand Automated ✅
      </button>
    </SectionCard>
  );
}

export default CurrentBrandSection;
