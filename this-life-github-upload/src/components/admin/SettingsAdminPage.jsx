import { useEffect, useState } from 'react';
import SectionCard from '../ui/SectionCard';
import useSettings from '../../hooks/useSettings';

function SettingsAdminPage() {
  const { settings, updateSettings, clearTodayData, exportAllData } = useSettings();
  const [dreamText, setDreamText] = useState(settings.dreamVersionDescription || '');
  const [countdownStartDate, setCountdownStartDate] = useState(settings.countdownStartDate || '');

  useEffect(() => {
    setDreamText(settings.dreamVersionDescription || '');
    setCountdownStartDate(settings.countdownStartDate || '');
  }, [settings.countdownStartDate, settings.dreamVersionDescription]);

  return (
    <div className="space-y-3">
      <SectionCard title="Settings" icon="⚙️" accent="#f5a623">
        <div className="rounded-xl border border-borderSubtle bg-cardAlt p-3">
          <p className="mb-1 text-xs uppercase text-zinc-500">App Name</p>
          <p className="title-font text-sm uppercase text-accent">THIS LIFE</p>
        </div>

        <div className="mt-3 space-y-2">
          <textarea
            className="textarea-dark"
            placeholder="Dream version description"
            value={dreamText}
            onChange={(event) => setDreamText(event.target.value)}
          />
          <input
            className="input-dark"
            type="date"
            value={countdownStartDate}
            onChange={(event) => setCountdownStartDate(event.target.value)}
          />
          <button
            className="btn-primary w-full"
            onClick={async () => {
              await updateSettings({
                dreamVersionDescription: dreamText,
                countdownStartDate
              });
            }}
          >
            Save Settings
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Data Controls" icon="🧹" accent="#ff4444">
        <div className="space-y-2">
          <button
            className="btn-danger w-full"
            onClick={async () => {
              if (!window.confirm("Clear today's timetable/protocol/connections data?")) return;
              await clearTodayData();
            }}
          >
            Clear Today's Data
          </button>
          <button className="btn-soft w-full" onClick={exportAllData}>
            Export All Data as JSON
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

export default SettingsAdminPage;
