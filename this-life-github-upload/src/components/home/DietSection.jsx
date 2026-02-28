import SectionCard from '../ui/SectionCard';
import { breakfastSuggestion } from '../../data/timetable';

function DietSection({ items, isWorkingZone }) {
  return (
    <SectionCard title="TODAY'S DIET" icon="🍽️" accent="#00ff88">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
            <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
            <p className="text-xs text-zinc-400">{item.time}</p>
          </div>
        ))}
      </div>

      {isWorkingZone && (
        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="title-font mb-2 text-xs uppercase tracking-[0.14em] text-emerald-300">{breakfastSuggestion.title}</p>
          <ul className="space-y-1 text-xs text-zinc-200">
            {breakfastSuggestion.items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}

export default DietSection;
