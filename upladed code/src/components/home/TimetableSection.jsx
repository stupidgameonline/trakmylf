import { Check, Circle, X } from 'lucide-react';
import SectionCard from '../ui/SectionCard';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/StatusBadge';

const categoryAccent = {
  fitness: '#f5a623',
  food: '#00ff88',
  work: '#ffd166',
  travel: '#ff2d78',
  sleep: '#7c7c7c'
};

const dayTypeMeta = {
  NORMAL: {
    title: "TODAY'S TIMETABLE",
    accent: '#f5a623',
    badge: null
  },
  WEDNESDAY: {
    title: 'WEDNESDAY - AI DAY',
    accent: '#00e5ff',
    badge: '🤖 AI RESEARCH DAY'
  },
  SUNDAY: {
    title: 'SUNDAY - REST DAY',
    accent: '#f5a623',
    badge: '☀️ REST DAY'
  }
};

function TimetableSection({ tasks, logs, markTask, complete, total, progress, dayType }) {
  const meta = dayTypeMeta[dayType] || dayTypeMeta.NORMAL;

  return (
    <SectionCard
      title={meta.title}
      icon="⏰"
      accent={meta.accent}
      rightSlot={
        <div className="text-right">
          <p className="digital-font text-xs text-zinc-200">
            {complete}/{total} completed
          </p>
          {meta.badge && <span className="badge mt-1 inline-block bg-cyan-500/20 text-cyan-300">{meta.badge}</span>}
        </div>
      }
    >
      <ProgressBar value={progress} />

      <div className="mt-3 max-h-[430px] space-y-2 overflow-y-auto pr-1">
        {tasks.map((task) => {
          const status = logs[task.id]?.status;
          const accent = categoryAccent[task.category] || '#2a2a2a';

          return (
            <div
              key={task.id}
              className={`rounded-xl border border-borderSubtle bg-cardAlt p-3 transition ${status ? 'opacity-90' : 'opacity-100'}`}
              style={{ borderLeft: `3px solid ${accent}` }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Circle className={`mt-1 h-4 w-4 ${status === 'complete' ? 'fill-success text-success' : 'text-zinc-500'}`} />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{task.title}</p>
                    <p className="text-xs text-zinc-400">{task.time}</p>
                    {task.optional && <span className="badge mt-1 bg-zinc-700/40 text-zinc-300">OPTIONAL</span>}
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>

              {!status && (
                <div className="flex gap-2">
                  <button className="btn-soft !min-h-[36px] flex-1 !px-2 text-xs text-green-300" onClick={() => markTask(task.id, 'complete')}>
                    <span className="inline-flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Complete
                    </span>
                  </button>
                  <button className="btn-soft !min-h-[36px] flex-1 !px-2 text-xs text-red-300" onClick={() => markTask(task.id, 'failed')}>
                    <span className="inline-flex items-center gap-1">
                      <X className="h-4 w-4" />
                      Failed
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

export default TimetableSection;
