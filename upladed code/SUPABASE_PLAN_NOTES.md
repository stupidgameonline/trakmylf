# Supabase Free Plan Notes (checked Feb 27, 2026)

From Supabase official docs:
- Active projects: 2
- Database size: up to 500 MB
- Monthly egress: 5 GB
- File storage: 1 GB
- Monthly active users: 50,000
- Max file upload size: 500 MB

Recommendations for this app:
- Keep logs compact and avoid storing large blobs in row fields.
- Use Netlify Drop only when needed (avoid excessive rebuild/deploy cycles).
- Export old data periodically if you want to stay well under table size limits.

Always verify latest limits before scaling:
- https://supabase.com/docs/guides/platform/org-and-project-limits
- https://supabase.com/pricing
