import SectionCard from '../ui/SectionCard';

function NewConnectionsSection({ count, setCount, saveCount }) {
  return (
    <SectionCard title="NEW CONNECTIONS" icon="🤝" accent="#00e5ff">
      <p className="text-xs text-zinc-300">Talk to at least 5 new people today. It's important for your growth.</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button className="btn-soft !min-h-[40px] !px-3" onClick={() => setCount((prev) => Math.max(0, prev - 1))}>
          −
        </button>
        <p className="digital-font text-xl font-bold text-cyan-300">Today: {count}</p>
        <button className="btn-soft !min-h-[40px] !px-3" onClick={() => setCount((prev) => prev + 1)}>
          +
        </button>
      </div>

      <div className="mt-2 flex justify-center gap-2">
        {Array.from({ length: 5 }, (_, idx) => (
          <span key={`dot-${idx}`} className={`h-3 w-3 rounded-full ${idx < count ? 'bg-success' : 'bg-zinc-700'}`} />
        ))}
      </div>

      <button className="btn-primary mt-3 w-full" onClick={() => saveCount(count)}>
        Save
      </button>
    </SectionCard>
  );
}

export default NewConnectionsSection;
