import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Wallet, TrendingUp, TrendingDown, ArrowLeftRight, Plus, Sparkles, Send,
  Landmark, Smartphone, CreditCard, Coins, Banknote, PiggyBank, Package,
  ShoppingCart, ReceiptText, Trash2, RefreshCw, Loader2, X, ArrowUpRight, ArrowDownRight,
  Building2, User as UserIcon, Wand2, ChevronRight, Search
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type WalletType = "cash" | "bank" | "mobile" | "card" | "digital";
type Scope = "personal" | "business" | "all";
type TxType =
  | "income" | "expense" | "transfer"
  | "sale" | "purchase"
  | "loan_given" | "loan_taken" | "repayment_in" | "repayment_out"
  | "return_in" | "return_out" | "stock_in" | "stock_out";

interface WalletRow {
  id: string; name: string; type: WalletType; provider: string | null;
  scope: "personal" | "business"; balance: number; currency: string;
  icon: string | null; color: string | null; is_default: boolean; archived: boolean;
  sort_order: number;
}
interface TxRow {
  id: string; wallet_id: string | null; transfer_to_wallet_id: string | null;
  type: TxType; amount: number; category: string | null; scope: "personal" | "business";
  party: string | null; note: string | null; occurred_at: string;
}

// ---------- Constants ----------
const DEFAULT_WALLETS: Array<Omit<WalletRow, "id" | "balance" | "currency" | "sort_order">> = [
  { name: "Cash",         type: "cash",   provider: null,      scope: "personal", icon: "coins",    color: "from-amber-400 to-orange-500",   is_default: true,  archived: false },
  { name: "Office Cash",  type: "cash",   provider: null,      scope: "business", icon: "banknote", color: "from-emerald-400 to-teal-500",   is_default: false, archived: false },
  { name: "Personal Cash",type: "cash",   provider: null,      scope: "personal", icon: "coins",    color: "from-sky-400 to-blue-500",       is_default: false, archived: false },
  { name: "Bank",         type: "bank",   provider: null,      scope: "personal", icon: "landmark", color: "from-slate-500 to-slate-700",    is_default: false, archived: false },
  { name: "bKash",        type: "mobile", provider: "bkash",   scope: "personal", icon: "smartphone", color: "from-pink-500 to-rose-600",     is_default: false, archived: false },
  { name: "Nagad",        type: "mobile", provider: "nagad",   scope: "personal", icon: "smartphone", color: "from-orange-500 to-red-600",    is_default: false, archived: false },
  { name: "Rocket",       type: "mobile", provider: "rocket",  scope: "personal", icon: "smartphone", color: "from-purple-500 to-fuchsia-600",is_default: false, archived: false },
  { name: "Upay",         type: "mobile", provider: "upay",    scope: "personal", icon: "smartphone", color: "from-cyan-500 to-blue-600",     is_default: false, archived: false },
  { name: "Card",         type: "card",   provider: null,      scope: "personal", icon: "credit-card", color: "from-indigo-500 to-violet-600", is_default: false, archived: false },
  { name: "Digital Wallet",type:"digital", provider: null,     scope: "personal", icon: "wallet",   color: "from-fuchsia-500 to-pink-600",   is_default: false, archived: false },
];

const CATEGORIES_PERSONAL = ["Food","Transport","Shopping","Medicine","Education","Family","Kids","Entertainment","Internet","WiFi Bill (Village)","WiFi Bill (City)","Dish Bill","Electricity Bill","Installment","Mobile Recharge","Bills","Travel","Rent","Investment","Savings","Other"];
const CATEGORIES_BUSINESS = ["Sale","Purchase","Salary","Advertising","Courier","Office Rent","Utility","WiFi Bill (Village)","WiFi Bill (City)","Dish Bill","Electricity Bill","Installment","Refund","Investment","Loan","Other"];

const walletIcon = (t: WalletType) => {
  switch (t) {
    case "cash": return Coins;
    case "bank": return Landmark;
    case "mobile": return Smartphone;
    case "card": return CreditCard;
    default: return Wallet;
  }
};

const fmtBDT = (n: number, bn = false) => {
  const abs = Math.abs(n);
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(abs);
  return `${n < 0 ? "-" : ""}৳${s}`;
};

const startOfToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const startOfMonth = () => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; };

const INCOME_TYPES: TxType[] = ["income","sale","loan_taken","repayment_in","return_in","stock_in"];
const EXPENSE_TYPES: TxType[] = ["expense","purchase","loan_given","repayment_out","return_out","stock_out"];

// ---------- Small components ----------
const MetricCard = ({ label, value, icon: Icon, tone = "default", sub }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className={cn(
      "relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-4 shadow-sm hover:shadow-md transition-all",
      "hover:-translate-y-0.5"
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={cn(
          "text-lg sm:text-xl font-semibold mt-1 tabular-nums truncate",
          tone === "positive" && "text-emerald-500",
          tone === "negative" && "text-rose-500",
        )}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      <div className={cn(
        "shrink-0 h-9 w-9 rounded-xl grid place-items-center",
        tone === "positive" ? "bg-emerald-500/10 text-emerald-500" :
        tone === "negative" ? "bg-rose-500/10 text-rose-500" :
        "bg-primary/10 text-primary"
      )}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </motion.div>
);

const SCOPE_BN: Record<string, string> = { personal: "ব্যক্তিগত", business: "ব্যবসা" };
const TYPE_BN: Record<string, string> = {
  cash: "নগদ", bank: "ব্যাংক", mobile: "মোবাইল", card: "কার্ড", digital: "ডিজিটাল",
};
const TX_TYPE_BN: Record<string, string> = {
  income: "আয়", expense: "খরচ", transfer: "ট্রান্সফার",
  sale: "বিক্রি", purchase: "ক্রয়",
  loan_given: "ধার দেয়া", loan_taken: "ধার নেয়া",
  repayment_in: "ফেরত পাওয়া", repayment_out: "ফেরত দেয়া",
  return_in: "ফেরত (আয়)", return_out: "ফেরত (খরচ)",
  stock_in: "স্টক ইন", stock_out: "স্টক আউট",
};
const CATEGORY_BN: Record<string, string> = {
  Food: "খাবার", Transport: "যাতায়াত", Shopping: "কেনাকাটা", Medicine: "ঔষধ",
  Education: "শিক্ষা", Family: "পরিবার", Kids: "সন্তান", Entertainment: "বিনোদন",
  Internet: "ইন্টারনেট", "Mobile Recharge": "মোবাইল রিচার্জ", Bills: "বিল",
  Travel: "ভ্রমণ", Rent: "ভাড়া", Investment: "বিনিয়োগ", Savings: "সঞ্চয়",
  Salary: "বেতন", Advertising: "বিজ্ঞাপন", Courier: "কুরিয়ার",
  "Office Rent": "অফিস ভাড়া", Utility: "ইউটিলিটি", Refund: "রিফান্ড",
  Loan: "ঋণ", Sale: "বিক্রি", Purchase: "ক্রয়", Other: "অন্যান্য",
  "WiFi Bill (Village)": "ওয়াইফাই বিল (গ্রাম)", "WiFi Bill (City)": "ওয়াইফাই বিল (শহর)",
  "Dish Bill": "ডিশ বিল", "Electricity Bill": "কারেন্ট বিল", Installment: "কিস্তি",
};
const bnLabel = (m: Record<string,string>, k: string | null | undefined, bn: boolean) =>
  !k ? "—" : (bn ? (m[k] ?? k) : k);

const WalletCard = ({ w, today, month, onOpen, bn }: { w: WalletRow; today: number; month: number; onOpen: () => void; bn: boolean }) => {
  const Icon = walletIcon(w.type);
  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
      className="relative text-left w-full rounded-2xl overflow-hidden border border-border/60 shadow-sm"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", w.color ?? "from-primary to-primary/60")} />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 grid place-items-center backdrop-blur">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{w.name}</p>
              <p className="text-[10px] uppercase tracking-wide opacity-80">
                {bn ? SCOPE_BN[w.scope] : w.scope} · {w.provider ?? (bn ? TYPE_BN[w.type] : w.type)}
              </p>
            </div>
          </div>
          {w.is_default && <Badge className="bg-white/20 text-white border-0 text-[10px]">{bn?"ডিফল্ট":"Default"}</Badge>}
        </div>
        <p className="text-2xl font-semibold mt-4 tabular-nums">{fmtBDT(Number(w.balance || 0), bn)}</p>
        <div className="flex items-center justify-between mt-2 text-[11px]">
          <span className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> {bn?"আজ":"Today"} {fmtBDT(today, bn)}</span>
          <span className="flex items-center gap-1"><ArrowDownRight className="h-3 w-3" /> {bn?"মাস":"Month"} {fmtBDT(month, bn)}</span>
        </div>
      </div>
    </motion.button>
  );
};

// ---------- Page ----------
const Finance = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const bn = language === "bn";
  const nav = useNavigate();

  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [scope, setScope] = useState<Scope>("all");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [q, setQ] = useState("");

  // quick action state
  const [qaOpen, setQaOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [qaType, setQaType] = useState<TxType | null>(null);
  const [qaAmount, setQaAmount] = useState("");
  const [qaWallet, setQaWallet] = useState<string>("");
  const [qaWallet2, setQaWallet2] = useState<string>("");
  const [qaCategory, setQaCategory] = useState<string>("");
  const [qaParty, setQaParty] = useState("");
  const [qaNote, setQaNote] = useState("");
  const [qaScope, setQaScope] = useState<"personal" | "business">("personal");

  // wallet detail
  const [detailWallet, setDetailWallet] = useState<WalletRow | null>(null);

  // AI assistant
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [loading, user, nav]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const [{ data: w }, { data: t }] = await Promise.all([
      supabase.from("finance_wallets").select("*").eq("user_id", user.id).order("sort_order").order("created_at"),
      supabase.from("finance_transactions").select("*").eq("user_id", user.id).order("occurred_at", { ascending: false }).limit(500),
    ]);
    setWallets((w as any) ?? []);
    setTxs((t as any) ?? []);
  }, [user]);

  // seed default wallets on first visit
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase.from("finance_wallets").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      if ((count ?? 0) === 0) {
        const rows = DEFAULT_WALLETS.map((w, i) => ({ ...w, user_id: user.id, sort_order: i }));
        await supabase.from("finance_wallets").insert(rows);
      }
      await loadAll();
    })();
  }, [user, loadAll]);

  // ---------- Derived metrics ----------
  const filteredWallets = useMemo(
    () => scope === "all" ? wallets : wallets.filter(w => w.scope === scope),
    [wallets, scope]
  );
  const filteredTxs = useMemo(
    () => scope === "all" ? txs : txs.filter(t => t.scope === scope),
    [txs, scope]
  );

  const metrics = useMemo(() => {
    const today0 = startOfToday().getTime();
    const month0 = startOfMonth().getTime();
    let todayIn = 0, todayOut = 0, monthIn = 0, monthOut = 0;
    for (const t of filteredTxs) {
      const at = new Date(t.occurred_at).getTime();
      const amt = Number(t.amount) || 0;
      if (INCOME_TYPES.includes(t.type)) {
        if (at >= today0) todayIn += amt;
        if (at >= month0) monthIn += amt;
      } else if (EXPENSE_TYPES.includes(t.type)) {
        if (at >= today0) todayOut += amt;
        if (at >= month0) monthOut += amt;
      }
    }
    const cashTotal = wallets.filter(w => w.type === "cash").reduce((s,w) => s + Number(w.balance||0), 0);
    const bankTotal = wallets.filter(w => w.type === "bank").reduce((s,w) => s + Number(w.balance||0), 0);
    const mbTotal   = wallets.filter(w => w.type === "mobile").reduce((s,w) => s + Number(w.balance||0), 0);
    const personal  = wallets.filter(w => w.scope === "personal").reduce((s,w) => s + Number(w.balance||0), 0);
    const business  = wallets.filter(w => w.scope === "business").reduce((s,w) => s + Number(w.balance||0), 0);
    const netWorth  = wallets.reduce((s,w) => s + Number(w.balance||0), 0);
    return {
      todayIn, todayOut, todayProfit: todayIn - todayOut,
      monthIn, monthOut, monthProfit: monthIn - monthOut,
      cashTotal, bankTotal, mbTotal, personal, business, netWorth,
    };
  }, [filteredTxs, wallets]);

  const walletDelta = useCallback((walletId: string, since: number) => {
    let delta = 0;
    for (const t of txs) {
      const at = new Date(t.occurred_at).getTime();
      if (at < since) continue;
      const amt = Number(t.amount) || 0;
      if (t.wallet_id === walletId) {
        if (INCOME_TYPES.includes(t.type)) delta += amt;
        else if (EXPENSE_TYPES.includes(t.type)) delta -= amt;
        else if (t.type === "transfer") delta -= amt;
      }
      if (t.transfer_to_wallet_id === walletId && t.type === "transfer") delta += amt;
    }
    return delta;
  }, [txs]);

  // ---------- Actions ----------
  const openQuick = (type: TxType) => {
    setQaType(type);
    setQaAmount(""); setQaCategory(""); setQaParty(""); setQaNote(""); setQaWallet2("");
    const def = filteredWallets.find(w => w.is_default) ?? filteredWallets[0];
    setQaWallet(def?.id ?? "");
    setQaScope(type === "sale" || type === "purchase" ? "business" : "personal");
    setQaOpen(true);
  };

  const saveQuick = async () => {
    if (!user || !qaType) return;
    const amount = Number(qaAmount);
    if (!amount || amount <= 0) { toast.error(bn ? "সঠিক টাকা লিখুন" : "Enter amount"); return; }
    if (!qaWallet) { toast.error(bn ? "ওয়ালেট নির্বাচন করুন" : "Pick a wallet"); return; }
    if (qaType === "transfer" && !qaWallet2) { toast.error(bn ? "গন্তব্য ওয়ালেট নির্বাচন করুন" : "Pick destination wallet"); return; }
    setBusy(true);
    const { error } = await supabase.from("finance_transactions").insert({
      user_id: user.id, wallet_id: qaWallet,
      transfer_to_wallet_id: qaType === "transfer" ? qaWallet2 : null,
      type: qaType, amount, category: qaCategory || null,
      scope: qaScope, party: qaParty || null, note: qaNote || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "সংরক্ষিত হয়েছে" : "Saved");
    setQaOpen(false);
    await loadAll();
  };

  const deleteTx = async (id: string) => {
    const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "মুছে ফেলা হয়েছে" : "Deleted");
    await loadAll();
  };

  const runAI = async () => {
    if (!aiText.trim()) return;
    setAiBusy(true); setAiPreview(null);
    try {
      const { data, error } = await supabase.functions.invoke("finance-ai-parse", {
        body: { text: aiText, wallets: wallets.map(w => ({ id: w.id, name: w.name, type: w.type, provider: w.provider })) },
      });
      if (error) throw error;
      setAiPreview(data?.parsed ?? null);
    } catch (e: any) {
      toast.error(e?.message ?? "AI failed");
    } finally { setAiBusy(false); }
  };

  const confirmAI = async () => {
    if (!user || !aiPreview) return;
    const p = aiPreview;
    const wallet_id = p.wallet_id || wallets.find(w => w.is_default)?.id || wallets[0]?.id;
    const { error } = await supabase.from("finance_transactions").insert({
      user_id: user.id,
      wallet_id,
      transfer_to_wallet_id: p.transfer_to_wallet_id || null,
      type: p.type, amount: Number(p.amount) || 0,
      category: p.category || null,
      scope: (p.scope === "business" ? "business" : "personal"),
      party: p.party || null,
      note: p.note || aiText,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "AI দিয়ে সংরক্ষিত" : "Saved via AI");
    setAiText(""); setAiPreview(null);
    await loadAll();
  };

  const visibleTxs = useMemo(() => {
    let list = filteredTxs;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(t =>
        (t.category ?? "").toLowerCase().includes(s) ||
        (t.party ?? "").toLowerCase().includes(s) ||
        (t.note ?? "").toLowerCase().includes(s) ||
        String(t.amount).includes(s)
      );
    }
    return list;
  }, [filteredTxs, q]);

  const walletById = (id: string | null) => wallets.find(w => w.id === id);

  // ---------- Render ----------
  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const CATEGORIES = qaScope === "business" ? CATEGORIES_BUSINESS : CATEGORIES_PERSONAL;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-6 py-3 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center shadow-sm">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold leading-tight truncate">{bn ? "ফিন্যান্স" : "Finance"}</p>
              <p className="text-[10px] text-muted-foreground">{bn ? "লাইফ OS" : "Life OS"}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-muted p-1">
            {(["all","personal","business"] as Scope[]).map(s => (
              <button key={s} onClick={() => setScope(s)}
                className={cn(
                  "text-[11px] px-3 py-1 rounded-full transition-all capitalize",
                  scope === s ? "bg-background shadow-sm" : "text-muted-foreground"
                )}>
                {s === "personal" ? <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {bn?"ব্যক্তিগত":"Personal"}</span> :
                 s === "business" ? <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {bn?"ব্যবসা":"Business"}</span> :
                 <span>{bn?"সব":"All"}</span>}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" onClick={loadAll} className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 pt-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-4 h-10 bg-muted/60 backdrop-blur">
            <TabsTrigger value="dashboard">{bn?"ড্যাশবোর্ড":"Dashboard"}</TabsTrigger>
            <TabsTrigger value="wallets">{bn?"ওয়ালেট":"Wallets"}</TabsTrigger>
            <TabsTrigger value="tx">{bn?"লেনদেন":"Transactions"}</TabsTrigger>
            <TabsTrigger value="ai"><span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />AI</span></TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="mt-4 space-y-4">
            {/* Hero balance */}
            <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-5">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
              <p className="text-xs text-muted-foreground">{bn?"বর্তমান নেট ওয়ার্থ":"Current Net Worth"}</p>
              <p className="text-3xl sm:text-4xl font-semibold mt-1 tabular-nums">{fmtBDT(metrics.netWorth, bn)}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><UserIcon className="h-3 w-3"/> {bn?"ব্যক্তিগত":"Personal"} <b className="text-foreground">{fmtBDT(metrics.personal, bn)}</b></span>
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3"/> {bn?"ব্যবসা":"Business"} <b className="text-foreground">{fmtBDT(metrics.business, bn)}</b></span>
              </div>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard label={bn?"আজকের আয়":"Today's Income"} value={fmtBDT(metrics.todayIn, bn)} icon={TrendingUp} tone="positive" />
              <MetricCard label={bn?"আজকের খরচ":"Today's Expense"} value={fmtBDT(metrics.todayOut, bn)} icon={TrendingDown} tone="negative" />
              <MetricCard label={bn?"আজকের লাভ":"Today's Profit"} value={fmtBDT(metrics.todayProfit, bn)} icon={PiggyBank} tone={metrics.todayProfit>=0?"positive":"negative"} />
              <MetricCard label={bn?"মাসিক আয়":"Monthly Income"} value={fmtBDT(metrics.monthIn, bn)} icon={TrendingUp} tone="positive" />
              <MetricCard label={bn?"মাসিক খরচ":"Monthly Expense"} value={fmtBDT(metrics.monthOut, bn)} icon={TrendingDown} tone="negative" />
              <MetricCard label={bn?"মাসিক লাভ":"Monthly Profit"} value={fmtBDT(metrics.monthProfit, bn)} icon={PiggyBank} tone={metrics.monthProfit>=0?"positive":"negative"} />
              <MetricCard label={bn?"মোট নগদ":"Total Cash"} value={fmtBDT(metrics.cashTotal, bn)} icon={Coins} />
              <MetricCard label={bn?"মোট ব্যাংক":"Total Bank"} value={fmtBDT(metrics.bankTotal, bn)} icon={Landmark} />
              <MetricCard label={bn?"মোবাইল ব্যাংকিং":"Mobile Banking"} value={fmtBDT(metrics.mbTotal, bn)} icon={Smartphone} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { t: "income", label: bn?"আয় যোগ":"Add Income", icon: TrendingUp },
                { t: "expense", label: bn?"খরচ যোগ":"Add Expense", icon: TrendingDown },
                { t: "transfer", label: bn?"ট্রান্সফার":"Transfer", icon: ArrowLeftRight },
                { t: "sale", label: bn?"বিক্রি":"Sale", icon: ShoppingCart },
                { t: "purchase", label: bn?"ক্রয়":"Purchase", icon: Package },
                { t: "loan_given", label: bn?"ধার দেয়া":"Loan Given", icon: Send },
              ].map(a => (
                <button key={a.t} onClick={() => openQuick(a.t as TxType)}
                  className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Wallets */}
          <TabsContent value="wallets" className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWallets.map(w => (
                <WalletCard key={w.id} w={w} bn={bn}
                  today={walletDelta(w.id, startOfToday().getTime())}
                  month={walletDelta(w.id, startOfMonth().getTime())}
                  onOpen={() => setDetailWallet(w)} />
              ))}
            </div>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="tx" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => openQuick("income")}>
                <TrendingUp className="h-4 w-4 mr-1" /> {bn?"আয় যোগ":"Add Income"}
              </Button>
              <Button className="h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white" onClick={() => openQuick("expense")}>
                <TrendingDown className="h-4 w-4 mr-1" /> {bn?"খরচ যোগ":"Add Expense"}
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder={bn?"খুঁজুন...":"Search transactions..."} className="pl-9 rounded-xl" />
            </div>
            <div className="space-y-2">
              {visibleTxs.length === 0 && (
                <div className="text-center py-16 text-sm text-muted-foreground">
                  {bn?"কোন লেনদেন নেই":"No transactions yet"}
                </div>
              )}
              {visibleTxs.map(t => {
                const income = INCOME_TYPES.includes(t.type);
                const isTransfer = t.type === "transfer";
                const w1 = walletById(t.wallet_id);
                const w2 = walletById(t.transfer_to_wallet_id);
                return (
                  <div key={t.id} className="rounded-xl border border-border/60 bg-card/70 backdrop-blur p-3 flex items-center gap-3">
                    <div className={cn(
                      "h-9 w-9 rounded-xl grid place-items-center shrink-0",
                      isTransfer ? "bg-sky-500/10 text-sky-500" :
                      income ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {isTransfer ? <ArrowLeftRight className="h-4 w-4" /> :
                       income ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate capitalize">
                        {t.category ? bnLabel(CATEGORY_BN, t.category, bn) : bnLabel(TX_TYPE_BN, t.type, bn)}
                        {t.party ? <span className="text-muted-foreground font-normal"> · {t.party}</span> : null}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {new Date(t.occurred_at).toLocaleString(bn?"bn-BD":"en-BD", { dateStyle: "medium", timeStyle: "short" })}
                        {" · "}{w1?.name ?? "—"}{isTransfer && w2 ? ` → ${w2.name}` : ""}
                        {t.note ? ` · ${t.note}` : ""}
                      </p>
                    </div>
                    <div className={cn("text-sm font-semibold tabular-nums shrink-0",
                      isTransfer ? "text-sky-500" : income ? "text-emerald-500" : "text-rose-500")}>
                      {isTransfer ? "↔" : income ? "+" : "-"}{fmtBDT(Number(t.amount), bn)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500" onClick={() => deleteTx(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* AI Assistant */}
          <TabsContent value="ai" className="mt-4 space-y-4">
            <Card className="p-4 border-border/60 bg-gradient-to-br from-primary/5 to-background">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary grid place-items-center">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{bn?"AI ফিন্যান্স সহকারী":"AI Finance Assistant"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {bn?"বাংলা/ইংরেজি/বাংলিশে লিখুন — যেকোনো লেনদেন এক লাইনে":"Write in Bangla/English/Banglish — any transaction in one line"}
                  </p>
                </div>
              </div>
              <Textarea
                value={aiText} onChange={e => setAiText(e.target.value)}
                placeholder={bn?"যেমন: bKash theke 500 tk tullam" : "e.g. Spent 350 on food, or Sold 2 projectors 16000 tk"}
                rows={3}
                className="resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-[11px] text-muted-foreground">{bn?"AI স্বয়ংক্রিয়ভাবে ধরন, ওয়ালেট, ক্যাটাগরি বুঝবে":"AI auto-detects type, wallet, category"}</p>
                <Button size="sm" onClick={runAI} disabled={aiBusy || !aiText.trim()}>
                  {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-1" /> {bn?"পার্স করুন":"Parse"}</>}
                </Button>
              </div>
              <AnimatePresence>
                {aiPreview && (
                  <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs text-muted-foreground mb-2">{bn?"পূর্বরূপ":"Preview"}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">{bn?"ধরন":"Type"}:</span> <b className="capitalize">{bnLabel(TX_TYPE_BN, aiPreview.type, bn)}</b></div>
                      <div><span className="text-muted-foreground">{bn?"পরিমাণ":"Amount"}:</span> <b>{fmtBDT(Number(aiPreview.amount)||0, bn)}</b></div>
                      <div><span className="text-muted-foreground">{bn?"ক্যাটাগরি":"Category"}:</span> <b>{bnLabel(CATEGORY_BN, aiPreview.category, bn)}</b></div>
                      <div><span className="text-muted-foreground">{bn?"পরিসর":"Scope"}:</span> <b className="capitalize">{bn ? (SCOPE_BN[aiPreview.scope ?? "personal"]) : (aiPreview.scope ?? "personal")}</b></div>
                      <div className="col-span-2"><span className="text-muted-foreground">{bn?"ওয়ালেট":"Wallet"}:</span> <b>{walletById(aiPreview.wallet_id)?.name ?? (wallets.find(w=>w.is_default)?.name ?? "—")}</b></div>
                      {aiPreview.party && <div className="col-span-2"><span className="text-muted-foreground">{bn?"পক্ষ":"Party"}:</span> <b>{aiPreview.party}</b></div>}
                    </div>
                    <div className="flex gap-2 justify-end mt-3">
                      <Button size="sm" variant="ghost" onClick={() => setAiPreview(null)}><X className="h-4 w-4" /></Button>
                      <Button size="sm" onClick={confirmAI}>{bn?"সংরক্ষণ":"Save"}<ChevronRight className="h-4 w-4 ml-1" /></Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              {[
                bn?"bKash theke 500 tk tullam":"Spent 350 on food",
                bn?"2 ta projector bikri korlam 16000 tk":"Sold 2 projectors 16000 tk",
                bn?"courier bill 250 dilam":"Paid courier bill 250",
                bn?"salary pelam 45000":"Received salary 45000",
              ].map(ex => (
                <button key={ex} onClick={() => setAiText(ex)} className="text-left text-xs rounded-xl border border-border/60 bg-card/70 p-3 hover:bg-muted transition">
                  <Sparkles className="h-3 w-3 inline mr-1 text-primary" />{ex}
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating quick-add FAB — always visible */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-xl border border-border/60 shadow-lg rounded-full p-1">
          <Button size="sm" variant="ghost" className="rounded-full h-9 px-3" onClick={() => openQuick("income")}>
            <TrendingUp className="h-4 w-4 mr-1 text-emerald-500" />{bn?"আয়":"Income"}
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full h-9 px-3" onClick={() => openQuick("expense")}>
            <TrendingDown className="h-4 w-4 mr-1 text-rose-500" />{bn?"খরচ":"Expense"}
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full h-9 px-3" onClick={() => { setTab("ai"); }}>
            <Sparkles className="h-4 w-4 mr-1 text-primary" />AI
          </Button>
        </div>
        <Button
          size="icon"
          onClick={() => setTypePickerOpen(true)}
          aria-label={bn?"নতুন লেনদেন":"New transaction"}
          className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/70 hover:scale-105 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Type picker — one tap to pick any transaction type */}
      <Sheet open={typePickerOpen} onOpenChange={setTypePickerOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{bn?"নতুন লেনদেন":"New Transaction"}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
            {([
              { t: "income", label: bn?"আয়":"Income", icon: TrendingUp, tone: "emerald" },
              { t: "expense", label: bn?"খরচ":"Expense", icon: TrendingDown, tone: "rose" },
              { t: "transfer", label: bn?"ট্রান্সফার":"Transfer", icon: ArrowLeftRight, tone: "sky" },
              { t: "sale", label: bn?"বিক্রি":"Sale", icon: ShoppingCart, tone: "emerald" },
              { t: "purchase", label: bn?"ক্রয়":"Purchase", icon: Package, tone: "rose" },
              { t: "loan_given", label: bn?"ধার দেয়া":"Loan Given", icon: Send, tone: "rose" },
              { t: "loan_taken", label: bn?"ধার নেয়া":"Loan Taken", icon: Send, tone: "emerald" },
              { t: "repayment_in", label: bn?"ফেরত পাওয়া":"Repaid In", icon: ArrowDownRight, tone: "emerald" },
              { t: "repayment_out", label: bn?"ফেরত দেয়া":"Repaid Out", icon: ArrowUpRight, tone: "rose" },
              { t: "return_in", label: bn?"রিটার্ন (আয়)":"Return In", icon: ArrowDownRight, tone: "emerald" },
              { t: "return_out", label: bn?"রিটার্ন (খরচ)":"Return Out", icon: ArrowUpRight, tone: "rose" },
              { t: "stock_in", label: bn?"স্টক ইন":"Stock In", icon: Package, tone: "sky" },
            ] as const).map(a => (
              <button
                key={a.t}
                onClick={() => { setTypePickerOpen(false); openQuick(a.t as TxType); }}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl grid place-items-center",
                  a.tone === "emerald" && "bg-emerald-500/10 text-emerald-500",
                  a.tone === "rose" && "bg-rose-500/10 text-rose-500",
                  a.tone === "sky" && "bg-sky-500/10 text-sky-500",
                )}>
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick action sheet */}
      <Sheet open={qaOpen} onOpenChange={setQaOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="capitalize">{qaType ? bnLabel(TX_TYPE_BN, qaType, bn) : ""}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-1 rounded-full bg-muted p-1 w-fit">
              {(["personal","business"] as const).map(s => (
                <button key={s} onClick={() => setQaScope(s)} className={cn(
                  "text-[11px] px-3 py-1 rounded-full capitalize",
                  qaScope === s ? "bg-background shadow-sm" : "text-muted-foreground"
                )}>{bn ? SCOPE_BN[s] : s}</button>
              ))}
            </div>

            <div>
              <Label className="text-xs">{bn?"টাকা":"Amount (৳)"}</Label>
              <Input type="number" inputMode="decimal" value={qaAmount} onChange={e => setQaAmount(e.target.value)}
                className="text-2xl font-semibold h-14 rounded-xl mt-1" placeholder="0" autoFocus />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[50, 100, 200, 500, 1000, 2000, 5000].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setQaAmount(String((Number(qaAmount) || 0) + v))}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 border border-border/60 tabular-nums"
                  >+{v}</button>
                ))}
                {qaAmount && (
                  <button type="button" onClick={() => setQaAmount("")}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    {bn?"মুছুন":"Clear"}
                  </button>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs">{qaType === "transfer" ? (bn?"যেখান থেকে":"From wallet") : (bn?"ওয়ালেট":"Wallet")}</Label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {wallets.filter(w => qaScope === w.scope || w.scope === "personal").slice(0, 8).map(w => (
                  <button key={w.id} type="button" onClick={() => setQaWallet(w.id)}
                    className={cn(
                      "text-left px-3 py-2 rounded-xl border text-xs transition-all",
                      qaWallet === w.id ? "border-primary bg-primary/10 shadow-sm" : "border-border/60 bg-card/50 hover:bg-muted"
                    )}>
                    <p className="font-medium truncate">{w.name}</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">৳{Number(w.balance||0).toFixed(0)}</p>
                  </button>
                ))}
              </div>
            </div>

            {qaType === "transfer" && (
              <div>
                <Label className="text-xs">{bn?"যেখানে":"To wallet"}</Label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {wallets.filter(w => w.id !== qaWallet).slice(0, 8).map(w => (
                    <button key={w.id} type="button" onClick={() => setQaWallet2(w.id)}
                      className={cn(
                        "text-left px-3 py-2 rounded-xl border text-xs transition-all",
                        qaWallet2 === w.id ? "border-primary bg-primary/10 shadow-sm" : "border-border/60 bg-card/50 hover:bg-muted"
                      )}>
                      <p className="font-medium truncate">{w.name}</p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">৳{Number(w.balance||0).toFixed(0)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {qaType !== "transfer" && (
              <div>
                <Label className="text-xs">{bn?"ক্যাটাগরি":"Category"}</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {CATEGORIES.map(c => (
                    <button key={c} type="button" onClick={() => setQaCategory(c)}
                      className={cn(
                        "text-[11px] px-3 py-1.5 rounded-full border transition-all",
                        qaCategory === c ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border/60 bg-card/50 hover:bg-muted"
                      )}>
                      {bn ? (CATEGORY_BN[c] ?? c) : c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(qaType === "sale" || qaType === "purchase" || qaType?.startsWith("loan") || qaType?.startsWith("repayment")) && (
              <div>
                <Label className="text-xs">{qaType === "sale" ? (bn?"গ্রাহক":"Customer") : (qaType === "purchase" ? (bn?"সরবরাহকারী":"Supplier") : (bn?"পক্ষ":"Party"))}</Label>
                <Input value={qaParty} onChange={e => setQaParty(e.target.value)} className="mt-1" />
              </div>
            )}

            <div>
              <Label className="text-xs">{bn?"নোট":"Note"}</Label>
              <Input value={qaNote} onChange={e => setQaNote(e.target.value)} className="mt-1" placeholder={bn?"ঐচ্ছিক":"Optional"} />
            </div>


            <Button className="w-full h-12 rounded-xl mt-2" onClick={saveQuick} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{bn?"সংরক্ষণ":"Save"} <ChevronRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Wallet detail */}
      <Dialog open={!!detailWallet} onOpenChange={(o) => !o && setDetailWallet(null)}>
        <DialogContent className="max-w-lg">
          {detailWallet && (
            <>
              <DialogHeader>
                <DialogTitle>{detailWallet.name}</DialogTitle>
              </DialogHeader>
              <div className={cn("rounded-2xl p-4 text-white bg-gradient-to-br", detailWallet.color ?? "from-primary to-primary/60")}>
                <p className="text-xs opacity-80 capitalize">{bn ? SCOPE_BN[detailWallet.scope] : detailWallet.scope} · {detailWallet.provider ?? (bn ? TYPE_BN[detailWallet.type] : detailWallet.type)}</p>
                <p className="text-3xl font-semibold tabular-nums mt-1">{fmtBDT(Number(detailWallet.balance||0), bn)}</p>
                <div className="flex justify-between text-[11px] mt-2 opacity-90">
                  <span>{bn?"আজ":"Today"} {fmtBDT(walletDelta(detailWallet.id, startOfToday().getTime()), bn)}</span>
                  <span>{bn?"মাস":"Month"} {fmtBDT(walletDelta(detailWallet.id, startOfMonth().getTime()), bn)}</span>
                </div>
              </div>
              <ScrollArea className="max-h-72 mt-2">
                <div className="space-y-1.5">
                  {txs.filter(t => t.wallet_id === detailWallet.id || t.transfer_to_wallet_id === detailWallet.id).slice(0, 60).map(t => {
                    const income = INCOME_TYPES.includes(t.type);
                    const incoming = t.transfer_to_wallet_id === detailWallet.id;
                    const sign = t.type === "transfer" ? (incoming ? "+" : "-") : income ? "+" : "-";
                    return (
                      <div key={t.id} className="flex items-center justify-between text-xs px-2 py-2 rounded-lg hover:bg-muted/50">
                        <div className="min-w-0">
                          <p className="capitalize truncate">{t.category ? bnLabel(CATEGORY_BN, t.category, bn) : bnLabel(TX_TYPE_BN, t.type, bn)}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{new Date(t.occurred_at).toLocaleString(bn?"bn-BD":"en-BD")}</p>
                        </div>
                        <span className={cn("tabular-nums font-medium", sign === "+" ? "text-emerald-500" : "text-rose-500")}>
                          {sign}{fmtBDT(Number(t.amount), bn)}
                        </span>
                      </div>
                    );
                  })}
                  {txs.filter(t => t.wallet_id === detailWallet.id || t.transfer_to_wallet_id === detailWallet.id).length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-6">{bn?"কোন লেনদেন নেই":"No transactions"}</p>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finance;
