## Finance মডিউল বড় আপগ্রেড

আপনার লিস্টে ১৩টি ফিচার আছে। কিছু আগে থেকেই আছে, কিছু নতুন করে বানাতে হবে। বাস্তবতা: সব একসাথে করলে কোয়ালিটি নষ্ট হবে — ৩টা ফেজে ভাগ করছি। প্রতি ফেজ শেষ হলে test করে পরের ফেজ।

### ইতিমধ্যে যা আছে ✅
- Wallets (Cash, bKash, Nagad, Rocket, Upay, Bank, Card, Office Cash, Personal Cash) — সব ব্যালেন্স Wallets ট্যাবে
- Quick Add FAB (+) — ১২ ধরনের এন্ট্রি
- আজকের সারাংশ (আয় / খরচ / লাভ)
- Recent Transactions (লেনদেন ট্যাব)
- AI Finance Assistant (বাংলা/ইংরেজি ন্যাচারাল ল্যাঙ্গুয়েজ → এন্ট্রি)

### ফেজ ১ — এখনই বানাচ্ছি (Frontend, বিদ্যমান data দিয়ে)
1. **📊 Spending Analysis** — ক্যাটাগরি-ওয়াইজ Pie/Donut chart (recharts), মাস filter সহ
2. **📅 Monthly Calendar Heatmap** — প্রতিদিন কত খরচ, রঙের গভীরতায় দেখাবে; দিন ক্লিক করলে সেই দিনের লেনদেন
3. **🎯 Budget** — `budgets` টেবিল আগে থেকেই আছে; ক্যাটাগরি-ওয়াইজ বাজেট সেট + অগ্রগতি বার (বাজেট / খরচ / বাকি)
4. **🧾 Due Management** — `debts` টেবিল আগে থেকেই আছে; কে পাবে / কার কাছে পাবেন — আলাদা ট্যাব
5. **🔔 Smart Reminders** — ড্যাশবোর্ডে ইনটেলিজেন্ট alert কার্ড (আজ কোনো এন্ট্রি নেই, বাজেট প্রায় শেষ, গতকালের চেয়ে কম লাভ)
6. নতুন ট্যাব লেআউট: Dashboard / Wallets / Transactions / Analytics / Budget / Debts / AI

### ফেজ ২ — নতুন backend দরকার
7. **📷 Receipt Scan** — ছবি upload → Gemini Vision (Lovable AI) → পার্স করে এন্ট্রি preview → confirm
8. **📦 Inventory Summary** — নতুন `finance_inventory` টেবিল (product, stock, low_stock_threshold, cost, price); Stock In/Sale এন্ট্রির সাথে auto-adjust; ড্যাশবোর্ডে "১০২ পিস, ৫টি Low Stock"

### ফেজ ৩ — বড় ফিচার (আলাদা করে ডিসকাস করতে হবে)
9. **👨‍👩‍👧 Family Finance** — শেয়ার্ড wallet system, family member invite, RLS পুনর্গঠন। এটার UX আলাদা ভাবে discuss করব।

---

### Technical (এই ফেজে যা করব)
- `recharts` লাইব্রেরি use করব pie + calendar heatmap-এর জন্য
- `budgets` টেবিলে period (monthly), category, amount — বিদ্যমান schema-তে থাকলে reuse
- `debts` টেবিলে party, amount, direction (owe/owed), due_date, status — বিদ্যমান schema check করে UI বানাব
- Reminders পুরোপুরি client-side derived (কোনো cron না, DB query থেকে হিসাব)
- Analytics ট্যাবে month picker + scope filter সমান্তরাল

### ফেজ ১-এ যা এই মুহূর্তে বানাব (approve করলে)
নতুন ৩টা ট্যাব (Analytics, Budget, Debts) + Dashboard-এ Smart Reminder কার্ড + Calendar heatmap।

Approve করলে ফেজ ১ শুরু করি। ফেজ ২ ও ৩ আলাদা turn-এ।
