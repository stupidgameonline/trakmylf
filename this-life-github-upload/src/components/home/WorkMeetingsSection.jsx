import SectionCard from '../ui/SectionCard';

function WorkMeetingsSection({ workItems, meetingItems }) {
  return (
    <SectionCard title="WORK & MEETINGS" icon="💼" accent="#f5a623">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">Work</p>
          {workItems.length ? (
            <div className="space-y-2">
              {workItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
                  <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.time}</p>
                  {item.description && <p className="mt-1 text-xs text-zinc-300">{item.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-zinc-500">No work scheduled. Add from admin panel.</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">Meetings</p>
          {meetingItems.length ? (
            <div className="space-y-2">
              {meetingItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
                  <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                  <p className="text-xs text-zinc-400">
                    {item.time}
                    {item.with ? ` • ${item.with}` : ''}
                  </p>
                  {item.notes && <p className="mt-1 text-xs text-zinc-300">{item.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-zinc-500">No meetings scheduled. Add from admin panel.</p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

export default WorkMeetingsSection;
