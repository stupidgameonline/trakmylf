import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase';
import { getDateKey } from '../utils/date';
import { readLocal, uid, writeLocal } from '../utils/localStore';

const WORK_KEY = 'this-life:fallback:work_schedule';
const MEETING_KEY = 'this-life:fallback:meetings_schedule';

const sortByDateTime = (a, b) => {
  const left = `${a.date} ${a.time || '00:00'}`;
  const right = `${b.date} ${b.time || '00:00'}`;
  return left.localeCompare(right);
};

const normalizeMeetingRow = (row) => ({
  id: row.id,
  title: row.title,
  with: row.with_whom || '',
  date: row.date,
  time: row.time || '',
  notes: row.notes || '',
  createdAt: row.created_at
});

const toMeetingInsert = (payload) => ({
  title: payload.title,
  with_whom: payload.with || '',
  date: payload.date,
  time: payload.time || '',
  notes: payload.notes || ''
});

export default function useWorkMeetings() {
  const [workItems, setWorkItems] = useState([]);
  const [meetingItems, setMeetingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      const localWork = readLocal(WORK_KEY, []);
      const localMeetings = readLocal(MEETING_KEY, []);
      setWorkItems(localWork.sort(sortByDateTime));
      setMeetingItems(localMeetings.sort(sortByDateTime));
      setLoading(false);
      return;
    }

    const [workRes, meetingsRes] = await Promise.all([
      supabase.from('work_schedule').select('*').order('date', { ascending: true }).order('time', { ascending: true }),
      supabase.from('meetings_schedule').select('*').order('date', { ascending: true }).order('time', { ascending: true })
    ]);

    if (workRes.error || meetingsRes.error) {
      const localWork = readLocal(WORK_KEY, []);
      const localMeetings = readLocal(MEETING_KEY, []);
      setWorkItems(localWork.sort(sortByDateTime));
      setMeetingItems(localMeetings.sort(sortByDateTime));
      setLoading(false);
      return;
    }

    const workRows = (workRes.data || []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      date: item.date,
      time: item.time || '',
      priority: item.priority || 'Medium',
      createdAt: item.created_at
    }));

    const meetingRows = (meetingsRes.data || []).map(normalizeMeetingRow);

    setWorkItems(workRows.sort(sortByDateTime));
    setMeetingItems(meetingRows.sort(sortByDateTime));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addWork = useCallback(
    async (payload) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(WORK_KEY, []);
        writeLocal(WORK_KEY, [...current, { id: uid('work'), ...payload, createdAt: new Date().toISOString() }]);
        await refresh();
        return;
      }

      const { error } = await supabase.from('work_schedule').insert({
        title: payload.title,
        description: payload.description || '',
        date: payload.date,
        time: payload.time || '',
        priority: payload.priority || 'Medium'
      });
      if (error) {
        const current = readLocal(WORK_KEY, []);
        writeLocal(WORK_KEY, [...current, { id: uid('work'), ...payload, createdAt: new Date().toISOString() }]);
      }
      await refresh();
    },
    [refresh]
  );

  const addMeeting = useCallback(
    async (payload) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(MEETING_KEY, []);
        writeLocal(MEETING_KEY, [...current, { id: uid('meeting'), ...payload, createdAt: new Date().toISOString() }]);
        await refresh();
        return;
      }

      const { error } = await supabase.from('meetings_schedule').insert(toMeetingInsert(payload));
      if (error) {
        const current = readLocal(MEETING_KEY, []);
        writeLocal(MEETING_KEY, [...current, { id: uid('meeting'), ...payload, createdAt: new Date().toISOString() }]);
      }
      await refresh();
    },
    [refresh]
  );

  const updateWork = useCallback(
    async (id, payload) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(WORK_KEY, []);
        writeLocal(
          WORK_KEY,
          current.map((item) => (item.id === id ? { ...item, ...payload } : item))
        );
        await refresh();
        return;
      }

      const { error } = await supabase
        .from('work_schedule')
        .update({
          title: payload.title,
          description: payload.description || '',
          date: payload.date,
          time: payload.time || '',
          priority: payload.priority || 'Medium'
        })
        .eq('id', id);
      if (error) {
        const current = readLocal(WORK_KEY, []);
        writeLocal(
          WORK_KEY,
          current.map((item) => (item.id === id ? { ...item, ...payload } : item))
        );
      }
      await refresh();
    },
    [refresh]
  );

  const updateMeeting = useCallback(
    async (id, payload) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(MEETING_KEY, []);
        writeLocal(
          MEETING_KEY,
          current.map((item) => (item.id === id ? { ...item, ...payload } : item))
        );
        await refresh();
        return;
      }

      const { error } = await supabase.from('meetings_schedule').update(toMeetingInsert(payload)).eq('id', id);
      if (error) {
        const current = readLocal(MEETING_KEY, []);
        writeLocal(
          MEETING_KEY,
          current.map((item) => (item.id === id ? { ...item, ...payload } : item))
        );
      }
      await refresh();
    },
    [refresh]
  );

  const deleteWork = useCallback(
    async (id) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(WORK_KEY, []);
        writeLocal(
          WORK_KEY,
          current.filter((item) => item.id !== id)
        );
        await refresh();
        return;
      }

      const { error } = await supabase.from('work_schedule').delete().eq('id', id);
      if (error) {
        const current = readLocal(WORK_KEY, []);
        writeLocal(
          WORK_KEY,
          current.filter((item) => item.id !== id)
        );
      }
      await refresh();
    },
    [refresh]
  );

  const deleteMeeting = useCallback(
    async (id) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(MEETING_KEY, []);
        writeLocal(
          MEETING_KEY,
          current.filter((item) => item.id !== id)
        );
        await refresh();
        return;
      }

      const { error } = await supabase.from('meetings_schedule').delete().eq('id', id);
      if (error) {
        const current = readLocal(MEETING_KEY, []);
        writeLocal(
          MEETING_KEY,
          current.filter((item) => item.id !== id)
        );
      }
      await refresh();
    },
    [refresh]
  );

  const todayKey = getDateKey();
  const todaysWork = useMemo(() => workItems.filter((item) => item.date === todayKey), [todayKey, workItems]);
  const todaysMeetings = useMemo(() => meetingItems.filter((item) => item.date === todayKey), [meetingItems, todayKey]);

  return {
    loading,
    workItems,
    meetingItems,
    todaysWork,
    todaysMeetings,
    addWork,
    addMeeting,
    updateWork,
    updateMeeting,
    deleteWork,
    deleteMeeting,
    refresh
  };
}
