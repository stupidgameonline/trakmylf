import SectionCard from '../ui/SectionCard';
import { useZone } from '../../contexts/ZoneContext';
import { getTodayTimetable } from '../../data/timetable';
import useTimetableLogs from '../../hooks/useTimetableLogs';

function TimetableAdminPage() {
  const { currentZone, dayType, now } = useZone();
  const tasks = getTodayTimetable(currentZone, dayType);
  const { logs, complete, total, progress } = useTimetableLogs(tasks, currentZone, now);

  return (
    <SectionCard title="Timetable" icon="⏰" accent="#f5a623">
      <p className="mb-2 text-xs text-zinc-300">
        Today completion: {complete}/{total} ({progress}%)
      </p>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-borderSubtle bg-cardAlt p-2">
            <p className="text-sm text-zinc-100">{task.title}</p>
            <p className="text-xs text-zinc-400">
              {task.time} • {logs[task.id]?.status || 'pending'}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default TimetableAdminPage;
