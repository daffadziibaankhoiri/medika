# AGENTS.md

## Project
- Next.js 16 App Router + React 19 demo app "HealTI": apotek inventory/POS UI, written in Indonesian.
- No backend, database, or API routes. All data is mock data in `lib/data.ts`; auth is demo-only.
- TypeScript strict, Tailwind v4 (via PostCSS), shadcn (`base-nova`), lucide icons.

## Commands
- Dev server: `.\node_modules\.bin\next.cmd dev` (also `next.cmd build`, `next.cmd start`).
- Typecheck: `.\node_modules\.bin\tsc.cmd --noEmit` — the only verification available.
- `pnpm` is the declared `packageManager` but is not installed here, and `npm.ps1` is blocked by PowerShell execution policy. Call executables from `node_modules\.bin\*.cmd` or via `node`.
- No lint, test, formatter, or CI config exists; do not invent test/lint commands.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `next build` will NOT catch type errors. Always run `tsc --noEmit` after edits.

## Architecture
- `app/(app)/layout.tsx` renders `components/app-shell.tsx` (sidebar + topbar) for every authenticated page. Each route `page.tsx` is a thin Server Component that renders a client view from `components/views/*` or that route's `_components/*`.
- `proxy.ts` is Next 16 middleware (not `middleware.ts`): it only checks that the `healti_session` cookie exists. Every non-public path is gated; add new public routes to `PUBLIC_PATHS` in `proxy.ts`.
- Access control lives in `lib/permissions.ts`. Adding a menu/route requires registering it in `NAV_ITEMS` (`components/app-shell.tsx`) AND (`ROLE_PERMISSIONS`, `permissionFromPath`, `defaultPathForRole`) in `lib/permissions.ts`.
- Sidebar active state, breadcrumb, and route permission come from `usePathname()`. Do not reintroduce `window.location.pathname` + `popstate` state: Next client navigation does not fire `popstate`, which leaves the sidebar highlight stale while the page changes.
- `lib/auth.ts` is intentionally insecure (hardcoded plaintext accounts, unsigned base64 cookie readable from JS). Keep it demo-grade; do not "harden" it unless explicitly asked.

## Conventions
- Comments, UI copy, and many identifiers are Indonesian; keep new comments and user-facing text in Indonesian.
- Styling is a single large `app/globals.css` with design tokens and hand-written classes (`.nav-item`, `.topbar`, `.sidebar`, …). Components mostly use those classes rather than Tailwind utilities — match that instead of adding utilities.
- Two `Button`s exist: the styled one in `components/ui.tsx` (custom primitives: `Button`, `Modal`, `Field`, `DataTable`, `EmptyRow`, `Status`) and the shadcn one in `components/ui/button.tsx`. Prefer `components/ui.tsx` for app screens.
- `lib/data.ts` is the single mock-data source. Expiry/stock status is computed against a fixed `TODAY = '2026-09-14'`, so date logic is deterministic and not real-time. Cost price (HPP) is only exposed via `costPriceOf()` and must stay gated by `canViewCostPrice` (Owner-only).
- Path alias `@/*` maps to the repo root. `.opencode/` contains agent skills with their own `node_modules`; do not modify it.
