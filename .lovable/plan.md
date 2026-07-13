# Premium Finance Module — Build Plan

This is a very large scope (dashboard, wallets, personal/business finance, inventory, sales, purchases, budgets, goals, debts, reports, analytics, AI assistant, receipt scanner, backups). Shipping it all in one turn would be unstable and unreviewable. I'll build it in **5 focused phases**, each independently usable, tested, and shippable.

Your current DB already has: `budgets`, `debts`, `savings_goals`, `planned_purchases`, `sellable_assets`, `transactions`. I'll extend, not replace.

---

## Phase 1 — Foundation + Dashboard + Wallets + Quick Actions + AI NL Entry
The "wow" core. After this phase Finance is already usable end-to-end.

**Schema (new tables, RLS scoped to `auth.uid()`)**
- `finance_wallets` — id, user_id, name, type (cash/bank/mobile/card/digital), provider (bkash/nagad/rocket/upay/…), scope (personal/business), balance, currency, icon, color, is_default, archived
- `finance_transactions` — id, user_id, wallet_id, type (income/expense/transfer/sale/purchase/loan/repayment), amount, category, subcategory, note, party (customer/supplier name), scope (personal/business), occurred_at, transfer_to_wallet_id, product_id (nullable), meta jsonb
- `finance_categories` — seeded personal + business categories (Bangla + English labels, icons)
- Update trigger + GRANTs + policies on all.

**Frontend**
- New route `/finance` replacing/wrapping current finance tab.
- Layout: sticky top summary, tabs (Dashboard · Wallets · Transactions · AI Assistant · More).
- **Dashboard cards** (all metrics you listed): Today/Monthly Income · Expense · Profit, Net Worth, Cash/Bank/Mobile Banking totals, Personal vs Business split, Receivable/Payable, Inventory value (from `shop_products`), Low stock, Pending orders (`shop_orders`), Pending payments. Apple-style rounded cards, soft shadows, animated counters, sparkline per card.
- **Wallets** — default seed on first visit (Cash, Office Cash, Personal Cash, Bank, bKash, Nagad, Rocket, Upay, Card, Digital). Each card: balance, today Δ, month Δ, mini history, tap → detail drawer with full transaction list.
- **Floating Action Button** (radial menu) — Add Income, Add Expense, Transfer, Add Sale, Add Purchase, Stock In/Out, Customer/Supplier Return, Add Loan, Receive Payment. Each opens a bottom-sheet with 2-3 fields max.
- **AI Assistant** (natural language entry) — edge function `finance-ai-parse` using Lovable AI (`google/gemini-3-flash-preview`) with structured output. Takes free text ("bKash theke 500 tk tullam", "2 ta projector bikri korlam 8000 tk"), returns `{type, amount, wallet, category, party, product, date}`, shows a confirmation card, one tap to save. Supports Bangla + English + Banglish.
- Transaction feed with filters, search, export CSV.

**Design**
- Apple-inspired: SF-style display font, generous whitespace, glass cards, subtle gradients per wallet type, framer-motion transitions, bilingual (respects existing `LanguageContext`), BDT ৳ formatting, Asia/Dhaka timezone.

---

## Phase 2 — Budgets + Goals + Debts (polished)
Rework existing tables into the new UI.
- Budget planner with 80/90/100% progress warnings, category picker, monthly reset.
- Goals with animated progress rings, target date, auto-calc monthly required saving.
- Debt tracker (owe / owed) with due-date reminders, payment history, optional interest.
- Notification center for budget/due/low-stock events (in-app + toast).

---

## Phase 3 — Inventory + Sales + Purchases
Extend existing `shop_products` / `shop_orders`.
- Add: `finance_suppliers`, `finance_stock_movements`, `finance_purchases`, `finance_purchase_items`, `finance_damages`.
- Product: SKU, barcode, purchase/selling price, min stock, warehouse, supplier.
- Sales flow: invoice, courier (Pathao/Steadfast/RedX enum), payment method, delivery status, auto profit calc, auto stock decrement, auto wallet credit.
- Purchase flow: supplier, due, purchase return, payment tracking, auto stock increment.
- Low-stock alerts feed the Dashboard.

---

## Phase 4 — Reports + Analytics + Receipt Scanner
- Report builder: Daily/Weekly/Monthly/Yearly, Cash Flow, P&L, Expense/Income analysis, Inventory, Sales, Tax, per-wallet. PDF/Excel/CSV export.
- Analytics tab: Recharts pie/bar/line/area — Income vs Expense, category breakdown, sales trend, inventory growth, cash-flow waterfall, profit trend.
- Receipt scanner: image upload → edge function `finance-receipt-scan` using Lovable AI vision → extracts merchant/amount/items/tax/category → prefilled transaction confirm sheet.

---

## Phase 5 — Security, Backup, Integrations
- App-lock: PIN + WebAuthn (fingerprint/Face on supported devices) gate for `/finance`. Optional OTP via existing Twilio for high-value actions.
- Encrypted export bundle (Excel/CSV/PDF) + Google Drive backup via existing `google_drive` connector when linked.
- Future-integration scaffolding (stubs + toggles) for WooCommerce, Facebook Orders, bKash/Nagad API, Pathao/Steadfast/RedX, Google Sheets/Calendar, WhatsApp/Email reports.

---

## Technical notes
- All edge functions Deno + Lovable AI Gateway (no user key required). Structured output via `Output.object` with fallback parse.
- Every new `public` table: GRANT to `authenticated` + `service_role`, RLS `auth.uid() = user_id`.
- Currency: BDT ৳ formatter, `Intl.NumberFormat('bn-BD')` for Bangla mode.
- Timezone: Asia/Dhaka everywhere via `date-fns-tz`.
- Portable — no dependency on any private ISP or paid API (matches your hosting-shift requirement).
- Dark/Light already wired via existing theme system; new module uses semantic tokens only (no hardcoded colors).

---

## What I need from you before I start Phase 1
1. **Green-light phased delivery?** (Phase 1 this turn, others on request.) Or do you want a single mega-turn build (higher risk of bugs & incomplete polish)?
2. **Business + Personal in one workspace, or separate toggle at top?** (Default: single workspace with a Personal/Business/All filter chip.)
3. **AI assistant language default** — Bangla, English, or auto-detect per message? (Default: auto-detect.)
4. Anything from the spec you want to **drop or defer** to keep Phase 1 lean?

Reply with answers (or just "go") and I'll ship Phase 1.
