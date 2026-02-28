import { useEffect, useMemo, useState } from 'react';
import HeaderBar from './HeaderBar';
import HeroClockCard from './HeroClockCard';
import DreamVersionCard from './DreamVersionCard';
import DailyQuoteCard from './DailyQuoteCard';
import TimetableSection from './TimetableSection';
import ProtocolSection from './ProtocolSection';
import WorkMeetingsSection from './WorkMeetingsSection';
import IdeasCaptureSection from './IdeasCaptureSection';
import WorkoutSection from './WorkoutSection';
import DietSection from './DietSection';
import CurrentBrandSection from './CurrentBrandSection';
import LiveBrandsSection from './LiveBrandsSection';
import NewConnectionsSection from './NewConnectionsSection';
import VisionSplash from './VisionSplash';
import { useZone } from '../../contexts/ZoneContext';
import { getDateKey } from '../../utils/date';
import { getTodayTimetable, getWorkoutItems, getDietItems } from '../../data/timetable';
import { getProtocolItems } from '../../data/protocol';
import useTimetableLogs from '../../hooks/useTimetableLogs';
import useProtocolLogs from '../../hooks/useProtocolLogs';
import useWorkMeetings from '../../hooks/useWorkMeetings';
import useIdeas from '../../hooks/useIdeas';
import useBrands from '../../hooks/useBrands';
import useConnections from '../../hooks/useConnections';
import useSettings from '../../hooks/useSettings';
import SkeletonBlock from '../ui/SkeletonBlock';

function HomePage() {
  const { now, currentZone, dayType, daysRemainingInZone, zoneChangeMessage, isNomad, isWorking, isSunday } = useZone();

  const timetable = useMemo(() => getTodayTimetable(currentZone, dayType), [currentZone, dayType]);
  const protocolItems = useMemo(() => getProtocolItems(currentZone, dayType), [currentZone, dayType]);
  const workoutItems = useMemo(() => getWorkoutItems(timetable, dayType), [dayType, timetable]);
  const dietItems = useMemo(() => getDietItems(timetable), [timetable]);

  const timetableHook = useTimetableLogs(timetable, currentZone, now);
  const protocolHook = useProtocolLogs(protocolItems, currentZone, dayType, now);
  const workMeetings = useWorkMeetings();
  const ideas = useIdeas();
  const brands = useBrands();
  const connections = useConnections(now);
  const settingsHook = useSettings();

  const [showVisionSplash, setShowVisionSplash] = useState(false);
  const todayKey = getDateKey(now);

  useEffect(() => {
    if (settingsHook.loading) return;

    const sessionSeen = sessionStorage.getItem('this-life-last-vision-date');
    const shouldShow = sessionSeen !== todayKey && settingsHook.settings.lastVisitDate !== todayKey;
    setShowVisionSplash(shouldShow);
  }, [settingsHook.loading, settingsHook.settings.lastVisitDate, todayKey]);

  const finishSplash = async () => {
    await settingsHook.setLastVisitDate(todayKey);
    sessionStorage.setItem('this-life-last-vision-date', todayKey);
    setShowVisionSplash(false);
  };

  return (
    <main className="app-shell">
      <VisionSplash
        open={showVisionSplash}
        zone={currentZone}
        topTask={timetable.find((item) => item.category === 'work')?.title || timetable[0]?.title}
        protocolItems={protocolItems}
        onFinish={finishSplash}
      />

      <HeaderBar />

      {zoneChangeMessage && (
        <div className="mb-3 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-2 text-xs text-cyan-200">{zoneChangeMessage}</div>
      )}

      <div className="space-y-3">
        <HeroClockCard now={now} zone={currentZone} daysRemaining={daysRemainingInZone} />

        {settingsHook.loading ? (
          <SkeletonBlock className="h-[220px]" />
        ) : (
          <DreamVersionCard
            settings={settingsHook.settings}
            onSaveDescription={(text) => settingsHook.updateSettings({ dreamVersionDescription: text })}
          />
        )}

        <DailyQuoteCard isSunday={isSunday} />

        {timetableHook.loading ? (
          <SkeletonBlock className="h-[320px]" />
        ) : (
          <TimetableSection
            tasks={timetable}
            logs={timetableHook.logs}
            markTask={timetableHook.markTask}
            complete={timetableHook.complete}
            total={timetableHook.total}
            progress={timetableHook.progress}
            dayType={dayType}
          />
        )}

        {protocolHook.loading ? (
          <SkeletonBlock className="h-[280px]" />
        ) : (
          <ProtocolSection
            items={protocolItems}
            logs={protocolHook.logs}
            streaks={protocolHook.streaks}
            markProtocol={protocolHook.markProtocol}
            passed={protocolHook.passed}
            total={protocolHook.total}
          />
        )}

        {!isSunday && (
          <WorkMeetingsSection workItems={workMeetings.todaysWork} meetingItems={workMeetings.todaysMeetings} />
        )}

        <IdeasCaptureSection latestIdeas={ideas.latestIdeas} addIdea={ideas.addIdea} />

        <WorkoutSection items={workoutItems} />

        <DietSection items={dietItems} isWorkingZone={isWorking} />

        {!isSunday && (
          <CurrentBrandSection
            currentBrand={brands.currentBrand}
            addCurrentBrandLog={brands.addCurrentBrandLog}
            markAutomated={brands.markAutomated}
          />
        )}

        <LiveBrandsSection brands={brands.monthlyRevenueByLiveBrand} logRevenue={brands.logRevenue} />

        {isNomad && (
          <NewConnectionsSection count={connections.count} setCount={connections.setCount} saveCount={connections.saveCount} />
        )}
      </div>
    </main>
  );
}

export default HomePage;
