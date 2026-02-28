# THIS LIFE

This app now supports two modes:
- Local mode (default): data saved in browser storage
- Cloud mode: Vercel API + MongoDB Atlas (sync across devices)

## Quick Deploy (Vercel + MongoDB Cloud Sync)
Follow `/Users/abhijeet/Documents/mylifeapp/VERCEL_SETUP.md`.

## Local Development
1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`

## Notes
- `VITE_ENABLE_SUPABASE` is optional and off by default.
- Supabase setup is kept only as an optional path and is not required.
