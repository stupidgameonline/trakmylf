import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const enableSupabase = String(import.meta.env.VITE_ENABLE_SUPABASE || '').toLowerCase() === 'true';

const hasValue = (value) => Boolean(value && String(value).trim().length > 0);

// Default behavior is local-only mode.
// Cloud sync is enabled only when VITE_ENABLE_SUPABASE=true and both keys are provided.
export const isSupabaseConfigured = enableSupabase && hasValue(supabaseUrl) && hasValue(supabaseAnonKey);

// Hooks only call Supabase when isSupabaseConfigured is true.
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://example.invalid';
const safeAnonKey = isSupabaseConfigured ? supabaseAnonKey : 'disabled';

export const supabase = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});
