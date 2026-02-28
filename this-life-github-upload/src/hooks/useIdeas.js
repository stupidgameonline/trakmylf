import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../supabase';
import { readLocal, uid, writeLocal } from '../utils/localStore';

const IDEAS_KEY = 'this-life:fallback:ideas';

const normalizeIdea = (row) => ({
  id: row.id,
  text: row.text,
  category: row.category,
  linkedBrand: row.linked_brand || null,
  createdAt: row.created_at
});

export default function useIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured) {
      setIdeas(readLocal(IDEAS_KEY, []));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
    if (error) {
      setIdeas(readLocal(IDEAS_KEY, []));
      setLoading(false);
      return;
    }

    setIdeas((data || []).map(normalizeIdea));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addIdea = useCallback(
    async (payload) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(IDEAS_KEY, []);
        writeLocal(IDEAS_KEY, [{ id: uid('idea'), ...payload, linkedBrand: payload.linkedBrand || null, createdAt: new Date().toISOString() }, ...current]);
        await refresh();
        return;
      }

      const { error } = await supabase.from('ideas').insert({
        text: payload.text,
        category: payload.category,
        linked_brand: payload.linkedBrand || null
      });
      if (error) {
        const current = readLocal(IDEAS_KEY, []);
        writeLocal(IDEAS_KEY, [{ id: uid('idea'), ...payload, linkedBrand: payload.linkedBrand || null, createdAt: new Date().toISOString() }, ...current]);
      }
      await refresh();
    },
    [refresh]
  );

  const updateIdea = useCallback(
    async (id, payload) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(IDEAS_KEY, []);
        writeLocal(
          IDEAS_KEY,
          current.map((item) => (item.id === id ? { ...item, ...payload } : item))
        );
        await refresh();
        return;
      }

      const mapped = {
        ...(payload.text !== undefined ? { text: payload.text } : {}),
        ...(payload.category !== undefined ? { category: payload.category } : {}),
        ...(payload.linkedBrand !== undefined ? { linked_brand: payload.linkedBrand } : {})
      };

      const { error } = await supabase.from('ideas').update(mapped).eq('id', id);
      if (error) {
        const current = readLocal(IDEAS_KEY, []);
        writeLocal(
          IDEAS_KEY,
          current.map((item) => (item.id === id ? { ...item, ...payload } : item))
        );
      }
      await refresh();
    },
    [refresh]
  );

  const deleteIdea = useCallback(
    async (id) => {
      if (!isSupabaseConfigured) {
        const current = readLocal(IDEAS_KEY, []);
        writeLocal(
          IDEAS_KEY,
          current.filter((item) => item.id !== id)
        );
        await refresh();
        return;
      }

      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) {
        const current = readLocal(IDEAS_KEY, []);
        writeLocal(
          IDEAS_KEY,
          current.filter((item) => item.id !== id)
        );
      }
      await refresh();
    },
    [refresh]
  );

  const latestIdeas = useMemo(() => ideas.slice(0, 3), [ideas]);

  return {
    ideas,
    latestIdeas,
    loading,
    addIdea,
    updateIdea,
    deleteIdea,
    refresh
  };
}
