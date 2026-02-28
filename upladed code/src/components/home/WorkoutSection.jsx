import SectionCard from '../ui/SectionCard';

function WorkoutSection({ items }) {
  return (
    <SectionCard title="WORKOUT" icon="🏋️" accent="#f5a623">
      <div className="space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
              <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
              <p className="text-xs text-zinc-400">{item.time}</p>
            </div>
          ))
        ) : (
          <p className="text-xs italic text-zinc-500">No workout blocks found in today's schedule.</p>
        )}
      </div>
    </SectionCard>
  );
}

export default WorkoutSection;
