import { useEffect, useMemo, useState } from 'react';
import { SkipForward } from 'lucide-react';

function VisionSplash({ open, zone, topTask, protocolItems, onFinish }) {
  const [slide, setSlide] = useState(0);

  const slides = useMemo(
    () => [
      {
        title: 'You will become the most handsome genius the world has ever witnessed.',
        body: 'Until then, be like a river - calm, relentless, unstoppable. Even rocks bow to your flow.'
      },
      {
        title: `${zone === 'WORKING' ? 'WORKING ZONE' : 'DIGITAL NOMAD ZONE'} ACTIVE`,
        body: `Top priority: ${topTask || 'Execute your highest leverage task today.'}`
      },
      {
        title: 'PROTOCOL REMINDER',
        body: protocolItems.map((item) => item.label).join(' • ')
      }
    ],
    [protocolItems, topTask, zone]
  );

  useEffect(() => {
    if (!open) return undefined;

    setSlide(0);
    const interval = setInterval(() => {
      setSlide((prev) => {
        if (prev >= 2) {
          clearInterval(interval);
          onFinish();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onFinish, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[460px] rounded-2xl border border-accent/30 bg-card p-6 shadow-glowAccent">
        <div className="mb-6">
          <p className="title-font bg-gradient-to-r from-accent via-accentAlt to-success bg-clip-text text-2xl font-black uppercase leading-tight text-transparent">
            {slides[slide].title}
          </p>
          <p className="mt-3 text-sm text-zinc-200">{slides[slide].body}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <span
                key={`dot-${idx}`}
                className={`h-2 w-2 rounded-full ${idx === slide ? 'bg-accent' : 'bg-zinc-600'}`}
              />
            ))}
          </div>
          <button className="btn-soft !min-h-[40px] !px-3 text-xs" onClick={onFinish}>
            <span className="inline-flex items-center gap-1">
              <SkipForward className="h-4 w-4" />
              Skip
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisionSplash;
