# Topup Shop Ledger

A transaction-tracking dashboard for a game topup shop. React + Vite + Tailwind,
Recharts for charts, all data stored in the browser's `localStorage` — no backend.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

To build a static production bundle:

```bash
npm run build
```

Output goes to `dist/` — this is a plain static site, you can host it anywhere
(Vercel, Netlify, GitHub Pages, or just open `dist/index.html` directly).

## Default login

```
username: admin
password: admin123
```

Change this immediately from **Staff** (or at least don't reuse it anywhere
sensitive — see the security note below).

The app seeds ~90 demo transactions on first run so the dashboard and charts
aren't empty. Clear them from **Settings → Clear all transactions** whenever
you're ready to start tracking real sales.

## What's in it

- **Overview** — cash in / cash out / net cash / profit KPIs, a 30-day cash
  flow chart, payment method split, revenue by game, and weekly profit.
- **Transactions** — full CRUD table: search, filter by type/status, sort any
  column, CSV export, add/edit/delete.
- **Reports** — 6-month revenue vs profit, status mix, cumulative net cash,
  top customers by spend.
- **Staff** — admin-only user management (admin / staff roles).
- **Settings** — shop name, currency, JSON backup export, data reset.

## Data model

Each transaction has: `type` (`topup` / `refund` / `expense`), `status`
(`completed` / `pending` / `failed` / `refunded`), customer name & contact,
game, coin package, `amount` (charged to customer), `costPrice` (what you
paid your supplier), `profit` (auto-calculated for completed topups),
payment method, notes, and date.

Cash in = completed topups. Cash out = completed refunds + expenses. Expenses
are for anything not tied to a customer order (supplier balance reloads,
rent, bills, etc.) — add them from **Add transaction → Expense**.

## Architecture notes

- `src/lib/storage.js` — the single localStorage abstraction. Every read/write
  in the app goes through this file, so swapping to a real backend later means
  changing one place, not every component.
- `src/lib/auth.js` — client-side only auth. Passwords are SHA-256 hashed
  before hitting localStorage (not plaintext), but **this is not real
  security** — there's no server, so anyone with devtools access to this
  browser profile can bypass it. It's meant to separate admin/staff *views*
  on a single shared device, not to protect against a determined attacker.
  Don't reuse these passwords anywhere else.
- `src/context/DataContext.jsx` — transactions CRUD + all derived stats
  (cash in/out, profit, pending/failed counts) computed in one `useMemo`.
- Routing is `HashRouter` (`/#/transactions` etc.) on purpose — it works when
  you open `dist/index.html` straight from disk or host it on something with
  no server-side rewrite rules (e.g. static S3/GitHub Pages).
- All data is per-browser. If you want staff on multiple devices sharing one
  ledger, you'll need a real backend (Postgres + an API) instead of
  localStorage.

## Known limitation to flag

Since everything is localStorage: clearing browser data, using a different
browser, or switching devices loses everything. Export a backup
(**Settings → Export full backup**) regularly, especially before this becomes
your real production ledger.
