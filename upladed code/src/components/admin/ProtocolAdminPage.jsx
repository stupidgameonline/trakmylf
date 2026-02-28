import SectionCard from '../ui/SectionCard';
import { useZone } from '../../contexts/ZoneContext';
import { getProtocolItems } from '../../data/protocol';
import useProtocolLogs from '../../hooks/useProtocolLogs';

function ProtocolAdminPage() {
  const { currentZone, dayType, now } = useZone();
  const items = getProtocolItems(currentZone, dayType);
  const { logs, streaks, passed, total } = useProtocolLogs(items, currentZone, dayType, now);

  return (
    <SectionCard title="Protocol" icon="🛡️" accent="#00e5ff">
      <p className="mb-2 text-xs text-zinc-300">
        Today's pass count: {passed}/{total}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-borderSubtle bg-cardAlt p-2">
            <p className="text-sm text-zinc-100">{item.label}</p>
            <p className="text-xs text-zinc-400">Status: {logs[item.id]?.status || 'pending'}</p>
            <div className="mt-1 flex gap-1">
              {(streaks[item.id] || []).map((entry) => (
                <span
                  key={`${item.id}-${entry.dateKey}`}
                  className={`h-2 w-2 rounded-full ${
                    entry.status === 'passed' ? 'bg-green-500' : entry.status === 'failed' ? 'bg-red-500' : 'bg-zinc-600'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default ProtocolAdminPage;
