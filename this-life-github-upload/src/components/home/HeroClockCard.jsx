import { format } from 'date-fns';
import SectionCard from '../ui/SectionCard';

function HeroClockCard({ now, zone, daysRemaining }) {
  const zoneStyles =
    zone === 'WORKING'
      ? {
          text: '🟢 WORKING ZONE',
          className: 'bg-green-500/20 text-green-300 border-green-500/30 shadow-glowSuccess'
        }
      : {
          text: '🔵 DIGITAL NOMAD ZONE',
          className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-glowCyan'
        };

  return (
    <SectionCard title="COMMAND CLOCK" icon="⚡" accent="#00e5ff" className="text-center">
      <p className="digital-font animate-pulseClock text-4xl font-bold text-accentCyan">{format(now, 'HH:mm:ss')}</p>
      <p className="mt-1 text-sm text-zinc-100">{format(now, 'EEEE, MMMM do, yyyy')}</p>
      <div className={`mx-auto mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${zoneStyles.className}`}>
        <span>{zoneStyles.text}</span>
        <span className="text-zinc-200">{daysRemaining} days remaining</span>
      </div>
    </SectionCard>
  );
}

export default HeroClockCard;
