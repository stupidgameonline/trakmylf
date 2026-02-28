# Supabase Cloud Sync Setup (Optional)

Use this only if you want cloud sync across devices.

## A) One-Time Schema Setup
1. Open Supabase Dashboard -> SQL Editor.
2. Run the SQL from `supabase/schema.sql`.
3. Confirm tables were created in Table Editor.

## B) Enable Cloud Mode in Vercel
1. Vercel Project -> Settings -> Environment Variables.
2. Add:
   - `VITE_ENABLE_SUPABASE=true`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy.

## C) Verify Persistence
1. Open deployed app and add/update any data.
2. Check Supabase Table Editor rows are being inserted:
   - `timetable_logs`
   - `protocol_logs`
   - `ideas`
   - `settings_app`

## D) Security Note
This app currently uses permissive single-user RLS policies because it has no Supabase Auth yet.
For stronger security, add Supabase Auth and tighten policies to authenticated user checks.
