import { Check, Shield, X } from 'lucide-react';
import SectionCard from '../ui/SectionCard';
import StatusBadge from '../ui/StatusBadge';

function StreakDots({ entries = [] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {entries.map((entry) => {
        let cls = 'border-zinc-600 bg-transparent';
        if (entry.status === 'passed') cls = 'border-green-500 bg-green-500';
        if (entry.status === 'failed') cls = 'border-red-500 bg-red-500';
        if (entry.status === 'na') cls = 'border-zinc-500 bg-zinc-500/70';

        return <span key={entry.dateKey} className={`h-2 w-2 rounded-full border ${cls}`} title={entry.dateKey} />;
      })}
    </div>
  );
}

function ProtocolSection({ items, logs, streaks, markProtocol, passed, total }) {
  return (
    <SectionCard
      title="PROTOCOL"
      icon={<Shield className="h-4 w-4" />}
      accent="#00e5ff"
      rightSlot={<p className="digital-font text-xs text-zinc-200">{passed}/{total}</p>}
    >
      <div className="space-y-2">
        {items.map((item) => {
          const status = logs[item.id]?.status;
          return (
            <div key={item.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-100">{item.label}</p>
                <StatusBadge status={status} />
              </div>

              {!status && (
                <div className="mt-2 flex gap-2">
                  <button
                    className="btn-soft !min-h-[36px] flex-1 !px-2 text-xs text-green-300"
                    onClick={() => markProtocol(item.id, 'passed')}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      Pass
                    </span>
                  </button>
                  <button
                    className="btn-soft !min-h-[36px] flex-1 !px-2 text-xs text-red-300"
                    onClick={() => markProtocol(item.id, 'failed')}
                  >
                    <span className="inline-flex items-center gap-1">
                      <X className="h-4 w-4" />
                      Fail
                    </span>
                  </button>
                </div>
              )}

              <StreakDots entries={streaks[item.id] || []} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

export default ProtocolSection;
