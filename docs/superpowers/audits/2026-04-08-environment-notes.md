# Environment Notes (working file — folded into final report)

## Dev environment
- DATABASE_URL: present (Supabase pooled PostgreSQL)
- AUTH_SECRET: present
- Migrations: up-to-date (1 migration applied; "Database schema is up to date!")
- `npm run dev` boot: not exercised — auditor lacks browser interaction capability
- Home page response: not measured

## Demo accounts (from prisma/seed.ts)
- Teacher: elena@proxima.edu / password123
- Students: marcus@student.proxima.edu, aisha@student.proxima.edu, jake@student.proxima.edu / password123
- Admin: admin@proxima.edu / password123

## Phase 2 strategy
- **Code-only fallback** (per spec §3) — runtime browser checks are out of scope for this audit run.
  Auditor cannot drive a browser, click through modals, observe hydration warnings, or verify Monaco
  mounting at runtime. All findings derived from static code review of the existing implementation
  against `CLAUDE.md`. Items that would require runtime verification are surfaced as ⚪ NOTE
  ("requires runtime verification") rather than dropped silently.

## Notes
- Prisma version 6.19.2 (warning: 7.7.0 available; not blocking).
- `package.json#prisma` config key is deprecated in Prisma 7 — pre-existing, unrelated to audit scope.
