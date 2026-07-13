# Finance Phase 2 Plan

আপনার লিস্ট আর বর্তমান Finance মডিউল মিলিয়ে দেখলাম — যেগুলো **আগে থেকেই আছে** সেগুলো বাদ দিয়ে শুধু **অনুপস্থিত অংশ** যোগ করব।

## ✅ আগে থেকেই আছে (নতুন করে করব না)

- **Dashboard**: আজকের আয়/খরচ/লাভ, মাসিক আয়/খরচ/লাভ, নগদ/ব্যাংক/মোবাইল ব্যাংকিং, ব্যক্তিগত ও ব্যবসা net worth
- **Wallets**: multi-wallet (অফিস ক্যাশ, ব্যক্তিগত, bKash, Nagad, Bank, Mobile Wallet — সব একসাথে)
- **Personal Finance categories**: বাজার, খাবার, যাতায়াত, মোবাইল, পরিবার, চিকিৎসা, বিল সব category হিসেবে
- **Budget**: মাসিক ক্যাটাগরি বাজেট + used/remaining প্রগ্রেস বার
- **Smart Alerts**: আজ এন্ট্রি নেই / আজ খরচ বেশি / লাভ কমেছে / মাসিক over-spend

## 🆕 যা যোগ করব

### ১. Inventory ট্যাব (নতুন)
- `inventory_products` table: name, sku, unit, purchase_price, sell_price, current_stock, low_stock_threshold
- `inventory_movements` table: product_id, type (`stock_in`/`stock_out`/`customer_return`/`supplier_return`/`damage`/`sale`), qty, unit_price, note, related_tx_id, occurred_at
- UI: পণ্য লিস্ট (কার্ড গ্রিড, বর্তমান স্টক + কম হলে লাল ব্যাজ), "পণ্য যোগ" ডায়ালগ, movement এন্ট্রি sheet (৫ ধরনের), প্রতি পণ্যের history

### ২. Sales ট্যাব (নতুন)
- `sales_orders` table: customer_name, phone, address, status (`order`/`payment`/`courier`/`delivery`/`return`), total, paid, courier_name, tracking, occurred_at
- `sales_order_items` table: order_id, product_id, qty, unit_price
- UI: Kanban-স্টাইল ৫টা status column, order card drag/click করে status বদলানো, নতুন অর্ডার ফর্ম (product picker → auto stock deduct)

### ৩. Reports ট্যাব (নতুন)
- Range picker: দৈনিক / সাপ্তাহিক / মাসিক / কাস্টম
- **লাভ-লোকসান**: total income − total expense − COGS
- **Top Products**: সবচেয়ে বেশি বিক্রি (qty + revenue)
- **Top Expense Categories**: বার চার্ট
- Export CSV button

### ৪. Dashboard-এ যোগ
- **মোট স্টক** কার্ড (সব product current_stock × sell_price)
- **কম স্টকের পণ্য** কার্ড (threshold-এর নিচে থাকা count)
- **আজকের বিক্রি** কার্ড (আজ sales_orders থেকে)

### ৫. Smart Alerts-এ যোগ
- স্টক কমে গেলে (threshold hit) → red alert
- কোনো ওয়ালেটে balance < 500 → amber alert

## Technical

- ৩টা নতুন migration (products, movements, sales_orders, sales_order_items) — সব RLS `auth.uid() = user_id`, GRANT authenticated
- Sale করলে auto: (a) inventory movement `sale` টাইপে qty deduct, (b) finance transaction `sale` টাইপে amount add
- ৩টা নতুন কম্পোনেন্ট: `InventoryTab.tsx`, `SalesTab.tsx`, `ReportsTab.tsx`
- Finance.tsx-এ ৩টা নতুন TabsTrigger (এখন ১০টা ট্যাব — horizontal scroll ঠিকই কাজ করবে)

## Delivery order (এক turn = এক migration approval দরকার)

1. **এখন**: Inventory migration → Inventory ট্যাব + Dashboard stock cards + স্টক alert
2. **পরের turn**: Sales migration → Sales ট্যাব + auto stock/finance sync
3. **তারপর**: Reports ট্যাব + wallet balance alert

**Approve করলে Step 1 (Inventory) শুরু করি।**
