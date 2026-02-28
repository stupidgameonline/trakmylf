import { Quote, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import SectionCard from '../ui/SectionCard';
import { quotes, motivationalBannerText, sundayBannerText } from '../../data/quotes';
import { getDailyQuoteIndex } from '../../utils/quote';

function DailyQuoteCard({ isSunday }) {
  const [index, setIndex] = useState(getDailyQuoteIndex(new Date()));

  return (
    <>
      <SectionCard
        title="Daily Quote"
        icon={<Quote className="h-4 w-4" />}
        accent="#00e5ff"
        rightSlot={
          <button className="btn-soft !min-h-[34px] !px-2" onClick={() => setIndex((prev) => (prev + 1) % quotes.length)}>
            <RefreshCw className="h-4 w-4 text-accent" />
          </button>
        }
      >
        <div className="flex items-start gap-2 rounded-lg bg-cardAlt p-3">
          <Quote className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm text-zinc-100">{quotes[index]}</p>
        </div>
      </SectionCard>

      <div className="section-card border border-accentAlt/40 bg-gradient-to-r from-accentAlt/20 to-pink-600/20 p-3 text-center shadow-[0_0_18px_rgba(255,45,120,0.23)]">
        <p className="text-sm font-semibold italic text-pink-100">{isSunday ? sundayBannerText : motivationalBannerText}</p>
      </div>
    </>
  );
}

export default DailyQuoteCard;
