import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../supabase';

function BackendStatusBanner() {
  const [schemaError, setSchemaError] = useState('');

  useEffect(() => {
    let active = true;

    const verify = async () => {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.from('settings_app').select('id').limit(1);
      if (!active) return;
      setSchemaError(error ? error.message || 'Schema not ready' : '');
    };

    verify();
    return () => {
      active = false;
    };
  }, []);

  // Local-only mode is intentionally silent for simplicity.
  if (!isSupabaseConfigured) return null;
  if (!schemaError) return null;

  return (
    <div className="sticky top-0 z-[75] border-b border-red-500/35 bg-red-900/30 px-3 py-2 text-xs text-red-100 backdrop-blur">
      <div className="mx-auto flex max-w-[480px] items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Supabase is configured but schema/policies failed. Run `supabase/schema.sql` in Supabase SQL Editor, then
          redeploy.
        </p>
      </div>
    </div>
  );
}

export default BackendStatusBanner;
