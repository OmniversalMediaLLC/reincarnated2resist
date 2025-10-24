# Copilot instructions — Hawk Eye Digital (reincarnated2resist)

This file gives concise, repo-specific guidance for automated coding agents so you can be productive immediately.

## Quick architecture summary
- Client: `/client` — React + Vite front-end (served by the server in prod)
- Server: `/server` — Express app, single entry `server/index.ts` (dev via `tsx`, bundled with esbuild for prod)
- Shared: `/shared/schema.ts` — Drizzle ORM table definitions + `drizzle-zod` insert schemas and exported TypeScript types
- Database: PostgreSQL (drizzle-kit), env via `DATABASE_URL`

Key runtime notes: server always listens on port 5000 (see `server/index.ts`). In development Vite is initialized after routes to avoid catch-all conflicts.

## Important scripts (see `package.json`)
- npm run dev  — development mode: NODE_ENV=development tsx server/index.ts (starts server + Vite)
- npm run build — builds client (vite) and bundles server with esbuild
- npm start — runs production bundle from `dist`
- npm run check — TypeScript (`tsc`)
- npm run db:push — apply Drizzle schema push (drizzle-kit)

Example: start dev
```bash
npm install
npm run dev
```

## Where to make common changes (hands-on examples)
- Add a new table / shape: edit `shared/schema.ts`. Use `createInsertSchema(...).omit({ id: true, createdAt: true })` to create insert types; export both table and Zod-based insert schemas.
- Add an API route: edit `server/routes.ts` and register the route with Express there. Routes use `storage` (see below) for data access.
- Implement storage-layer behavior: `server/storage.ts` exports `MemStorage` (sample data) and `DatabaseStorage` (uses `db` + Drizzle). Update `storage` initialization to swap implementations.
- CSV import: `server/csvParser.ts` contains `fetchCSVData`, `processMerchItems`, `processAlbumAndTracks`, `processSingles`, and `importCSVData`. The server exposes `/api/import-csv` (POST) which accepts `{ csvUrl }` and starts `importCSVData` asynchronously.

## Integration & runtime patterns to respect
- Drizzle + Zod: `shared/schema.ts` defines pgTable(..) and then `createInsertSchema` — prefer these helpers for type safety and to keep DB <-> API in sync.
- Storage pattern: prefer calling `storage.*` (imported from `server/storage.ts`) instead of querying `db` directly; `DatabaseStorage` centralizes SQL and returning rows via `.returning()`.
- WebSocket: `/ws` upgrade handled manually in `server/routes.ts` (uses `ws` with `noServer`). Keep WebSocket upgrade logic separate from Vite HMR.
- Vite: only setup during development via `setupVite` in `server/vite.ts`; production serves static files via `serveStatic`.

## Environment & external dependencies
- DATABASE_URL: required for `DatabaseStorage` (Postgres). Local dev may use `MemStorage` or a local Postgres instance.
- S3 / media: media URLs are stored in the DB as full URLs. Look at `server/storage.ts` and `attached_assets/` for sample data and placeholders.

## Useful quick examples (concrete)
- Trigger CSV import (starts async job):
  POST /api/import-csv { "csvUrl": "https://.../file.csv" } — server returns 202 and imports in background.
- Import sample dataset (synchronous): POST /api/import-sample-data — calls `processAlbumAndTracks` and `processSingles` with internal sample data.

## Errors, logging, and observability
- Request logging: middleware in `server/index.ts` logs `/api` responses and trims long JSON. Keep that logging when adding endpoints.
- Express error handler (in `server/index.ts`) returns `{ message }` and rethrows; follow the same shape for thrown errors (set `.status` for HTTP codes).

## Small rules for contributors/agents
- Preserve `createInsertSchema` usage when changing db types.
- New routes must validate input using Zod where appropriate (see `insertSubscriberSchema` usage in `server/routes.ts`).
- Avoid changing port 5000 unless you update `server/index.ts` comment and docs.

If anything here is unclear or you'd like more examples (e.g., a sample DB migration workflow or a step-by-step CSV import test), tell me which section to expand and I will iterate.
