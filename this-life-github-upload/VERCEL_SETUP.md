# Vercel + MongoDB (Simple Step-by-Step)

Use these exact steps.

## 1) MongoDB Atlas setup (one-time)
1. Open [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create project: `this-life`.
3. Create free cluster (M0).
4. Create database user (example: `thislife_user`).
5. In **Network Access**, add `0.0.0.0/0`.
6. In **Browse Collections**, create database: `this_life`.

## 2) Build your final MongoDB URI
Your password must be URL-encoded.

Example:
- Raw password: `Alpha#12345`
- Encoded password: `Alpha%2312345`

Final URI format:
```txt
mongodb+srv://thislife_user:ENCODED_PASSWORD@this-life-cluster.tlnjzi1.mongodb.net/this_life?retryWrites=true&w=majority&appName=this-life-cluster
```

## 3) Upload code to GitHub
1. Create repo on GitHub.
2. Upload all files from this project.

## 4) Deploy on Vercel
1. Open [Vercel New Project](https://vercel.com/new).
2. Import your GitHub repo.
3. Keep defaults (Vite auto-detected).
4. In **Environment Variables**, add:
   - `MONGODB_URI` = your full URI
   - `MONGODB_DB` = `this_life`
   - `APP_ACCESS_CODE` = `Alpha#12345` (must match app login code)
5. Click **Deploy**.

## 5) Verify cloud storage
1. Open live app and login.
2. Add one idea.
3. Open app from another device/browser and login.
4. If the idea appears there too, MongoDB sync works.

## 6) If cloud sync does not work
1. Check Vercel logs for `/api/state`.
2. Recheck `MONGODB_URI`, `MONGODB_DB`, `APP_ACCESS_CODE`.
3. Confirm Atlas user has read/write access and IP `0.0.0.0/0` exists.
4. Redeploy once.
