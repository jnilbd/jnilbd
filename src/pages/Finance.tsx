import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, HandCoins, Target, Sparkles,
  Plus, Trash2, LogOut, User as UserIcon, Calendar as CalIcon, Save, Brain,
  ShoppingCart, Package, Check
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import FinanceCalculator from "@/components/finance/FinanceCalculator";

const EXPENSE_CATS_BN = ["খাবার ও বাজার","পরিবহন","ভাড়া","বিল","স্বাস্থ্য","শিক্ষা","কেনাকাটা","বিনোদন","পরিবার","অন্যান্য"];
const EXPENSE_CATS_EN = ["Food & Groceries","Transport","Rent","Bills","Health","Education","Shopping","Entertainment","Family","Other"];
const INCOME_CATS_BN = ["বেতন","ফ্রিল্যান্সিং","ব্যবসা","ভাড়া আয়","উপহার","অন্যান্য"];
const INCOME_CATS_EN = ["Salary","Freelance","Business","Rental","Gift","Other"];

const COLORS = ["hsl(var(--primary))","hsl(var(--secondary))","#10b981","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#ec4899","#84cc16","#64748b"];

type Tx = { id: string; type: "income"|"expense"; category: string; amount: number; note: string|null; occurred_on: string };
type Debt = { id: string; direction: "lent"|"borrowed"; counterparty: string; amount: number; paid_amount: number; due_date: string|null; note: string|null; is_settled: boolean };
type Budget = { id: string; category: string; monthly_limit: number };
type Goal = { id: string; title: string; target_amount: number; saved_amount: number; target_date: string|null };
type Profile = { id: string; full_name: string|null; phone: string|null; monthly_income: number; currency: string };
type Plan = { id: string; item: string; est_price: number; priority: string; plan_date: string|null; is_done: boolean; note: string|null };
type Asset = { id: string; item: string; est_value: number; condition: string; is_sold: boolean; sold_amount: number|null; note: string|null };

const Finance = () => {
  const { user, loading, signOut } = useAuth();
  const { language } = useLanguage();
  const nav = useNavigate();
  const bn = language === "bn";
  const expCats = bn ? EXPENSE_CATS_BN : EXPENSE_CATS_EN;
  const incCats = bn ? INCOME_CATS_BN : INCOME_CATS_EN;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [insightBusy, setInsightBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [user, loading, nav]);

  const loadAll = async () => {
    if (!user) return;
    const [p, t, d, b, g, pl, a] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("occurred_on", { ascending: false }).limit(500),
      supabase.from("debts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("budgets").select("*").eq("user_id", user.id),
      supabase.from("savings_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      (supabase as any).from("planned_purchases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      (supabase as any).from("sellable_assets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (p.data) setProfile(p.data as Profile);
    if (t.data) setTxs(t.data as Tx[]);
    if (d.data) setDebts(d.data as Debt[]);
    if (b.data) setBudgets(b.data as Budget[]);
    if (g.data) setGoals(g.data as Goal[]);
    if (pl.data) setPlans(pl.data as Plan[]);
    if (a.data) setAssets(a.data as Asset[]);
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [user]);

  // Derived analytics — current month
  const stats = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const monthTx = txs.filter(t => t.occurred_on.startsWith(ym));
    const income = monthTx.filter(t => t.type === "income").reduce((s,t)=>s+t.amount,0);
    const expense = monthTx.filter(t => t.type === "expense").reduce((s,t)=>s+t.amount,0);
    const net = income - expense;
    const lent = debts.filter(d=>d.direction==="lent" && !d.is_settled).reduce((s,d)=>s+(d.amount-d.paid_amount),0);
    const borrowed = debts.filter(d=>d.direction==="borrowed" && !d.is_settled).reduce((s,d)=>s+(d.amount-d.paid_amount),0);
    const byCat: Record<string,number> = {};
    monthTx.filter(t=>t.type==="expense").forEach(t => { byCat[t.category] = (byCat[t.category]||0)+t.amount; });
    const pieData = Object.entries(byCat).map(([name,value])=>({name,value}));
    // last 6 months bar
    const months: { m:string; income:number; expense:number }[] = [];
    for (let i=5;i>=0;i--) {
      const dt = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const k = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`;
      const ms = txs.filter(t=>t.occurred_on.startsWith(k));
      months.push({
        m: dt.toLocaleString(bn?"bn-BD":"en-US",{month:"short"}),
        income: ms.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),
        expense: ms.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0),
      });
    }
    return { income, expense, net, lent, borrowed, pieData, months };
  }, [txs, debts, bn]);

  // ----- forms -----
  const [tx, setTx] = useState<{ type:"income"|"expense"; category:string; amount:string; note:string; occurred_on:string }>({
    type: "expense", category: "", amount: "", note: "", occurred_on: new Date().toISOString().slice(0,10),
  });
  const addTx = async () => {
    if (!user || !tx.category || !tx.amount) { toast.error(bn?"ক্যাটেগরি ও পরিমাণ দিন":"Fill category and amount"); return; }
    const amt = Math.round(Number(tx.amount));
    if (!Number.isFinite(amt) || amt < 0) { toast.error("Invalid amount"); return; }
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id, type: tx.type, category: tx.category, amount: amt, note: tx.note || null, occurred_on: tx.occurred_on,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(bn?"যোগ হয়েছে":"Added");
    setTx({ ...tx, amount:"", note:"" });
    loadAll();
  };
  const delTx = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setTxs(txs.filter(t=>t.id!==id));
  };

  const [debt, setDebt] = useState<{ direction:"lent"|"borrowed"; counterparty:string; amount:string; due_date:string; note:string }>({
    direction: "lent", counterparty: "", amount: "", due_date: "", note: "",
  });
  const addDebt = async () => {
    if (!user || !debt.counterparty || !debt.amount) { toast.error(bn?"নাম ও পরিমাণ দিন":"Fill name and amount"); return; }
    const { error } = await supabase.from("debts").insert({
      user_id: user.id, direction: debt.direction, counterparty: debt.counterparty,
      amount: Math.round(Number(debt.amount)), due_date: debt.due_date || null, note: debt.note || null,
    });
    if (error) return toast.error(error.message);
    setDebt({ ...debt, counterparty:"", amount:"", note:"", due_date:"" });
    toast.success(bn?"যোগ হয়েছে":"Added");
    loadAll();
  };
  const settleDebt = async (d: Debt) => {
    const { error } = await supabase.from("debts").update({ is_settled: true, paid_amount: d.amount }).eq("id", d.id);
    if (error) return toast.error(error.message);
    loadAll();
  };
  const delDebt = async (id: string) => {
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setDebts(debts.filter(d=>d.id!==id));
  };

  const [budget, setBudget] = useState({ category: "", monthly_limit: "" });
  const addBudget = async () => {
    if (!user || !budget.category || !budget.monthly_limit) return toast.error(bn?"সব ফিল্ড পূরণ করুন":"Fill all fields");
    const { error } = await supabase.from("budgets").upsert({
      user_id: user.id, category: budget.category, monthly_limit: Math.round(Number(budget.monthly_limit)),
    }, { onConflict: "user_id,category" });
    if (error) return toast.error(error.message);
    setBudget({ category:"", monthly_limit:"" });
    loadAll();
  };
  const delBudget = async (id: string) => {
    await supabase.from("budgets").delete().eq("id", id);
    loadAll();
  };

  const [goal, setGoal] = useState({ title:"", target_amount:"", target_date:"" });
  const addGoal = async () => {
    if (!user || !goal.title || !goal.target_amount) return toast.error(bn?"টাইটেল ও লক্ষ্য দিন":"Fill title and target");
    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id, title: goal.title, target_amount: Math.round(Number(goal.target_amount)),
      target_date: goal.target_date || null,
    });
    if (error) return toast.error(error.message);
    setGoal({ title:"", target_amount:"", target_date:"" });
    loadAll();
  };
  const addToGoal = async (g: Goal, add: number) => {
    const { error } = await supabase.from("savings_goals").update({ saved_amount: g.saved_amount + add }).eq("id", g.id);
    if (error) return toast.error(error.message);
    loadAll();
  };
  const delGoal = async (id: string) => {
    await supabase.from("savings_goals").delete().eq("id", id);
    loadAll();
  };

  // Planned purchases
  const [plan, setPlan] = useState({ item: "", est_price: "", priority: "medium", plan_date: "", note: "" });
  const addPlan = async () => {
    if (!user || !plan.item || !plan.est_price) return toast.error(bn?"আইটেম ও দাম দিন":"Fill item and price");
    const { error } = await (supabase as any).from("planned_purchases").insert({
      user_id: user.id, item: plan.item, est_price: Math.round(Number(plan.est_price)),
      priority: plan.priority, plan_date: plan.plan_date || null, note: plan.note || null,
    });
    if (error) return toast.error(error.message);
    setPlan({ item:"", est_price:"", priority:"medium", plan_date:"", note:"" });
    toast.success(bn?"যোগ হয়েছে":"Added");
    loadAll();
  };
  const togglePlanDone = async (p: Plan) => {
    await (supabase as any).from("planned_purchases").update({ is_done: !p.is_done }).eq("id", p.id);
    loadAll();
  };
  const delPlan = async (id: string) => {
    await (supabase as any).from("planned_purchases").delete().eq("id", id);
    setPlans(plans.filter(p=>p.id!==id));
  };

  // Sellable assets
  const [asset, setAsset] = useState({ item: "", est_value: "", condition: "good", note: "" });
  const addAsset = async () => {
    if (!user || !asset.item || !asset.est_value) return toast.error(bn?"আইটেম ও মূল্য দিন":"Fill item and value");
    const { error } = await (supabase as any).from("sellable_assets").insert({
      user_id: user.id, item: asset.item, est_value: Math.round(Number(asset.est_value)),
      condition: asset.condition, note: asset.note || null,
    });
    if (error) return toast.error(error.message);
    setAsset({ item:"", est_value:"", condition:"good", note:"" });
    toast.success(bn?"যোগ হয়েছে":"Added");
    loadAll();
  };
  const markAssetSold = async (a: Asset) => {
    const amt = prompt(bn?"কত টাকায় বিক্রি হলো?":"Sold for how much?", String(a.est_value));
    if (!amt) return;
    await (supabase as any).from("sellable_assets").update({ is_sold: true, sold_amount: Math.round(Number(amt)) }).eq("id", a.id);
    loadAll();
  };
  const delAsset = async (id: string) => {
    await (supabase as any).from("sellable_assets").delete().eq("id", id);
    setAssets(assets.filter(a=>a.id!==id));
  };

  const planTotal = plans.filter(p=>!p.is_done).reduce((s,p)=>s+Number(p.est_price),0);
  const assetTotal = assets.filter(a=>!a.is_sold).reduce((s,a)=>s+Number(a.est_value),0);
  const assetSoldTotal = assets.filter(a=>a.is_sold).reduce((s,a)=>s+Number(a.sold_amount||0),0);

  // Comprehensive (all-time) snapshot
  const snapshot = useMemo(() => {
    const totalIncome = txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
    const totalExpense = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    const lifetimeNet = totalIncome - totalExpense;
    const debtNet = stats.lent - stats.borrowed; // +ve = others owe you
    const liquidAssets = assetTotal; // could be turned into cash
    const estimatedNetWorth = lifetimeNet + debtNet + liquidAssets;
    const goalsSaved = goals.reduce((s,g)=>s+Number(g.saved_amount||0),0);
    const goalsTarget = goals.reduce((s,g)=>s+Number(g.target_amount||0),0);
    return { totalIncome, totalExpense, lifetimeNet, debtNet, liquidAssets, estimatedNetWorth, goalsSaved, goalsTarget };
  }, [txs, stats.lent, stats.borrowed, assetTotal, goals]);

  const saveProfile = async () => {
    if (!user || !profile) return;
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, phone: profile.phone, monthly_income: profile.monthly_income, currency: profile.currency,
    }).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    toast.success(bn?"সংরক্ষিত":"Saved");
  };

  const askAI = async () => {
    setInsightBusy(true);
    setInsight("");
    try {
      const summary = {
        currency: profile?.currency || "BDT",
        monthly_income_target: profile?.monthly_income || 0,
        this_month: { income: stats.income, expense: stats.expense, net: stats.net },
        expenses_by_category: stats.pieData,
        debts: { lent_outstanding: stats.lent, borrowed_outstanding: stats.borrowed, items: debts.filter(d=>!d.is_settled).map(d=>({direction:d.direction, party:d.counterparty, owed:d.amount-d.paid_amount, due:d.due_date})) },
        budgets: budgets.map(b=>({category:b.category, limit:b.monthly_limit})),
        goals: goals.map(g=>({title:g.title, target:g.target_amount, saved:g.saved_amount, by:g.target_date})),
      };
      const { data, error } = await supabase.functions.invoke("finance-insight", { body: { summary, language } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setInsight((data as any).insight || "");
    } catch (e:any) {
      toast.error(e.message || "AI error");
    } finally { setInsightBusy(false); }
  };

  if (loading || !user) return <div className="min-h-[60vh] flex items-center justify-center">Loading…</div>;

  const cur = (n: number) => `${profile?.currency==="USD"?"$":"৳"}${n.toLocaleString(bn?"bn-BD":"en-US")}`;

  // budget usage
  const monthExpByCat: Record<string,number> = {};
  const ym = new Date().toISOString().slice(0,7);
  txs.filter(t=>t.type==="expense" && t.occurred_on.startsWith(ym)).forEach(t=>{ monthExpByCat[t.category]=(monthExpByCat[t.category]||0)+t.amount; });

  return (
    <div className="container py-6 lg:py-10 space-y-6">
      {/* Header */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-bg-primary text-white flex items-center justify-center shadow-glow">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">
              {bn?"আপনার ফিন্যান্স":"Your Finance"}
            </h1>
            <p className="text-xs text-muted-foreground">{profile?.full_name || user.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={async()=>{ await signOut(); nav("/"); }}>
          <LogOut className="w-4 h-4 mr-2" /> {bn?"লগআউট":"Sign out"}
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: bn?"এই মাসের আয়":"Income (mo)", value: stats.income, icon: TrendingUp, color: "from-emerald-500 to-green-600" },
          { label: bn?"এই মাসের ব্যয়":"Expense (mo)", value: stats.expense, icon: TrendingDown, color: "from-rose-500 to-red-600" },
          { label: bn?"নেট সঞ্চয়":"Net Savings", value: stats.net, icon: PiggyBank, color: stats.net>=0?"from-blue-500 to-indigo-600":"from-orange-500 to-amber-600" },
          { label: bn?"বকেয়া (নেট)":"Net Owed", value: stats.lent - stats.borrowed, icon: HandCoins, color: "from-violet-500 to-fuchsia-600" },
        ].map((s,i)=>(
          <Card key={i} className="overflow-hidden border-border/60">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-2`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</div>
              <div className="font-display font-bold text-xl mt-0.5">{cur(s.value)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-9 w-full h-auto">
          <TabsTrigger value="dashboard">{bn?"ড্যাশবোর্ড":"Dashboard"}</TabsTrigger>
          <TabsTrigger value="tx">{bn?"লেনদেন":"Transactions"}</TabsTrigger>
          <TabsTrigger value="plans">{bn?"পরিকল্পনা":"Plans"}</TabsTrigger>
          <TabsTrigger value="assets">{bn?"আমার সম্পদ":"My Assets"}</TabsTrigger>
          <TabsTrigger value="debts">{bn?"ধার-দেনা":"Debts"}</TabsTrigger>
          <TabsTrigger value="budget">{bn?"বাজেট":"Budgets"}</TabsTrigger>
          <TabsTrigger value="goals">{bn?"লক্ষ্য":"Goals"}</TabsTrigger>
          <TabsTrigger value="calc">{bn?"ক্যালকুলেটর":"Calculator"}</TabsTrigger>
          <TabsTrigger value="profile">{bn?"প্রোফাইল":"Profile"}</TabsTrigger>
        </TabsList>

        <TabsContent value="calc" className="mt-4">
          <FinanceCalculator />
        </TabsContent>



        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="mt-4 space-y-4">
          {/* Comprehensive financial snapshot */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl gradient-bg-primary text-white flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">{bn?"আর্থিক সারাংশ":"Financial Snapshot"}</h3>
                    <p className="text-[11px] text-muted-foreground">{bn?"আপনার সব ডেটা একসাথে — জীবনের সম্পূর্ণ চিত্র":"All your data combined — full lifetime picture"}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{bn?"স্বয়ংক্রিয় হিসাব":"Auto-calculated"}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <div className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{bn?"মোট আয় (সর্বমোট)":"Total Income (lifetime)"}</div>
                  <div className="font-display font-bold text-lg">{cur(snapshot.totalIncome)}</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10">
                  <div className="text-[10px] uppercase font-semibold text-rose-700 dark:text-rose-400 mb-1">{bn?"মোট ব্যয় (সর্বমোট)":"Total Expense (lifetime)"}</div>
                  <div className="font-display font-bold text-lg">{cur(snapshot.totalExpense)}</div>
                </div>
                <div className={`p-3 rounded-xl ${snapshot.lifetimeNet>=0?"bg-blue-500/10":"bg-amber-500/10"}`}>
                  <div className="text-[10px] uppercase font-semibold mb-1">{bn?"নেট সঞ্চয় (সর্বমোট)":"Net Saved (lifetime)"}</div>
                  <div className={`font-display font-bold text-lg ${snapshot.lifetimeNet>=0?"text-blue-700 dark:text-blue-400":"text-amber-700 dark:text-amber-400"}`}>{cur(snapshot.lifetimeNet)}</div>
                </div>
                <div className="p-3 rounded-xl bg-violet-500/10">
                  <div className="text-[10px] uppercase font-semibold text-violet-700 dark:text-violet-400 mb-1">{bn?"ধার-দেনা (নেট)":"Debts (net)"}</div>
                  <div className="font-display font-bold text-lg">{cur(snapshot.debtNet)}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {bn?"পাবো":"In"}: {cur(stats.lent)} • {bn?"দিবো":"Out"}: {cur(stats.borrowed)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-teal-500/10">
                  <div className="text-[10px] uppercase font-semibold text-teal-700 dark:text-teal-400 mb-1">{bn?"বিক্রয়যোগ্য সম্পদ":"Sellable Assets"}</div>
                  <div className="font-display font-bold text-lg">{cur(snapshot.liquidAssets)}</div>
                  {assetSoldTotal>0 && <div className="text-[10px] text-muted-foreground mt-0.5">{bn?"ইতিমধ্যে বিক্রি":"Already sold"}: {cur(assetSoldTotal)}</div>}
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <div className="text-[10px] uppercase font-semibold text-orange-700 dark:text-orange-400 mb-1">{bn?"পরিকল্পিত খরচ":"Planned Spend"}</div>
                  <div className="font-display font-bold text-lg">{cur(planTotal)}</div>
                </div>
                <div className="p-3 rounded-xl bg-pink-500/10">
                  <div className="text-[10px] uppercase font-semibold text-pink-700 dark:text-pink-400 mb-1">{bn?"লক্ষ্যে সঞ্চিত":"Saved for Goals"}</div>
                  <div className="font-display font-bold text-lg">{cur(snapshot.goalsSaved)}</div>
                  {snapshot.goalsTarget>0 && <div className="text-[10px] text-muted-foreground mt-0.5">/ {cur(snapshot.goalsTarget)}</div>}
                </div>
                <div className={`p-3 rounded-xl ${snapshot.estimatedNetWorth>=0?"bg-gradient-to-br from-primary/20 to-secondary/20":"bg-destructive/10"}`}>
                  <div className="text-[10px] uppercase font-semibold mb-1">{bn?"আনুমানিক নেট ওয়ার্থ":"Est. Net Worth"}</div>
                  <div className={`font-display font-bold text-lg ${snapshot.estimatedNetWorth>=0?"gradient-text":"text-destructive"}`}>{cur(snapshot.estimatedNetWorth)}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{bn?"সঞ্চয় + পাবো + সম্পদ":"savings + receivable + assets"}</div>
                </div>
              </div>
              {snapshot.debtNet < 0 && (
                <div className="mt-3 text-xs p-2 rounded-lg bg-amber-500/10 text-amber-900 dark:text-amber-200">
                  💡 {bn?`আপনার মোট দেনা পাওনার চেয়ে ${cur(Math.abs(snapshot.debtNet))} বেশি — পরিকল্পনা করে পরিশোধ করুন।`:`You owe ${cur(Math.abs(snapshot.debtNet))} more than you're owed — plan repayments.`}
                </div>
              )}
              {stats.net < 0 && assetTotal > 0 && (
                <div className="mt-2 text-xs p-2 rounded-lg bg-teal-500/10 text-teal-900 dark:text-teal-200">
                  💡 {bn?`এই মাসে ঘাটতি ${cur(Math.abs(stats.net))} — সম্পদ বিক্রি করে ${cur(assetTotal)} তোলা সম্ভব।`:`Monthly shortfall ${cur(Math.abs(stats.net))} — you could liquidate ${cur(assetTotal)} from assets.`}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friendly persona-based tips */}
          <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">💡</div>
                <div>
                  <h3 className="font-display font-bold">{bn?"সবার জন্য আর্থিক গাইড":"Money Guide For Everyone"}</h3>
                  <p className="text-[11px] text-muted-foreground">{bn?"আপনি যেই পেশারই হোন — আপনার জন্য সাহায্য":"Whoever you are — help tailored for you"}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    icon:"👔", title: bn?"চাকরিজীবী":"Salaried Employee", color:"from-blue-500/10 to-indigo-500/10 border-blue-500/30",
                    tips: bn?[
                      "৫০/৩০/২০ নিয়ম: ৫০% প্রয়োজন, ৩০% ইচ্ছা, ২০% সঞ্চয়",
                      "জরুরি তহবিল: ৬ মাসের খরচ আলাদা রাখুন",
                      "DPS/সঞ্চয়পত্র দিয়ে কর সাশ্রয় করুন",
                      "EMI মোট আয়ের ৪০% এর বেশি নয়",
                    ]:[
                      "50/30/20 rule: 50% needs, 30% wants, 20% savings",
                      "Emergency fund: keep 6 months of expenses",
                      "Use DPS/savings certificates to save tax",
                      "Keep EMIs under 40% of income",
                    ],
                  },
                  {
                    icon:"🏪", title: bn?"ব্যবসায়ী":"Business Owner", color:"from-amber-500/10 to-orange-500/10 border-amber-500/30",
                    tips: bn?[
                      "ব্যবসা ও ব্যক্তিগত হিসাব আলাদা রাখুন",
                      "নগদ প্রবাহ (cash flow) সাপ্তাহিক ট্র্যাক করুন",
                      "ইনভেন্টরি = টাকা; অলস স্টক বিক্রি করুন",
                      "ভ্যাট/আয়কর সময়মতো; ৩-৬ মাসের চলতি মূলধন সংরক্ষণ",
                    ]:[
                      "Separate business and personal accounts",
                      "Track cash flow weekly, not monthly",
                      "Inventory = cash; liquidate dead stock",
                      "Pay VAT/tax on time; keep 3-6 months working capital",
                    ],
                  },
                  {
                    icon:"🌾", title: bn?"কৃষক":"Farmer", color:"from-emerald-500/10 to-green-500/10 border-emerald-500/30",
                    tips: bn?[
                      "ফসল বিমা ও কৃষি ঋণ সুবিধা নিন (BKB, RAKUB)",
                      "মৌসুমী আয় ভেবে বাৎসরিক বাজেট করুন",
                      "শস্য বহুমুখীকরণ — সব ডিম এক ঝুড়িতে নয়",
                      "সরকারি ভর্তুকি ও ন্যায্যমূল্য কেন্দ্র খোঁজ রাখুন",
                    ]:[
                      "Use crop insurance & agri loans (BKB, RAKUB)",
                      "Budget yearly — income is seasonal",
                      "Diversify crops — don't depend on one",
                      "Track govt subsidies & fair-price centres",
                    ],
                  },
                  {
                    icon:"🎓", title: bn?"স্টুডেন্ট":"Student", color:"from-violet-500/10 to-purple-500/10 border-violet-500/30",
                    tips: bn?[
                      "মাসিক খরচ লিখুন — চা-নাস্তাও যোগ করুন",
                      "টিউশন/ফ্রিল্যান্স দিয়ে ছোট আয়ের অভ্যাস",
                      "প্রতি মাসে ১০০-৫০০ টাকা হলেও জমান",
                      "অপ্রয়োজনীয় সাবস্ক্রিপশন বাদ দিন",
                    ]:[
                      "Log every expense — even small snacks",
                      "Build small income via tutoring/freelance",
                      "Save even 100-500 BDT every month",
                      "Cancel unused subscriptions",
                    ],
                  },
                  {
                    icon:"🔍", title: bn?"বেকার/চাকরি খুঁজছেন":"Job Seeker", color:"from-rose-500/10 to-pink-500/10 border-rose-500/30",
                    tips: bn?[
                      "জরুরি খরচ আগে — খাবার, বাসা, যাতায়াত",
                      "ছোট অনলাইন কাজ (Fiverr, Upwork) চেষ্টা করুন",
                      "ফ্যামিলি/বন্ধুর ধার রেকর্ড রাখুন",
                      "বিক্রয়যোগ্য সম্পদ চিহ্নিত করে নগদে আনুন",
                    ]:[
                      "Prioritise: food, rent, transport",
                      "Try micro-gigs (Fiverr, Upwork, local)",
                      "Track loans from family/friends",
                      "Identify sellable assets to raise cash",
                    ],
                  },
                  {
                    icon:"🏠", title: bn?"গৃহিণী":"Homemaker", color:"from-pink-500/10 to-fuchsia-500/10 border-pink-500/30",
                    tips: bn?[
                      "মাসিক বাজার বাজেট আগে থেকে ঠিক করুন",
                      "ছোট সঞ্চয় (সমিতি, DPS) দিয়ে শুরু করুন",
                      "হোম-বেইজড আয়: সেলাই, রান্না, টিউশন",
                      "সব রসিদ একসাথে রাখুন — খরচ যাচাইয়ের জন্য",
                    ]:[
                      "Set monthly grocery budget in advance",
                      "Start small (samity, DPS) to save",
                      "Home income: tailoring, cooking, tutoring",
                      "Keep receipts together to review spending",
                    ],
                  },
                ].map((p,i)=>(
                  <div key={i} className={`p-3 rounded-xl border bg-gradient-to-br ${p.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{p.icon}</span>
                      <p className="font-semibold text-sm">{p.title}</p>
                    </div>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      {p.tips.map((tip,j)=>(<li key={j} className="flex gap-1.5"><span className="text-primary">•</span><span>{tip}</span></li>))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                <p className="font-semibold mb-1">🎯 {bn?"যেকোনো অবস্থায় ৫টি মূলনীতি":"5 rules for any situation"}</p>
                <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                  <li>{bn?"আয়ের চেয়ে কম খরচ করুন":"Spend less than you earn"}</li>
                  <li>{bn?"প্রতি মাসে কিছু না কিছু সঞ্চয় করুন":"Save something every month"}</li>
                  <li>{bn?"উচ্চ-সুদের ঋণ আগে শোধ করুন":"Pay off high-interest debt first"}</li>
                  <li>{bn?"একাধিক আয়ের উৎস তৈরি করুন":"Build multiple income streams"}</li>
                  <li>{bn?"স্বাস্থ্য ও জীবন বিমা নিন":"Get health & life insurance"}</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card><CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold">{bn?"৬ মাসের প্রবণতা":"6-Month Trend"}</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={stats.months}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--border))", borderRadius:8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="income" name={bn?"আয়":"Income"} fill="hsl(var(--primary))" radius={[6,6,0,0]} />
                    <Bar dataKey="expense" name={bn?"ব্যয়":"Expense"} fill="hsl(var(--secondary))" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-4">
              <h3 className="font-display font-bold mb-3">{bn?"ক্যাটেগরি অনুযায়ী ব্যয় (এই মাস)":"Expenses by Category (This month)"}</h3>
              {stats.pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                  {bn?"কোনো ব্যয় নেই":"No expenses yet"}
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={stats.pieData} dataKey="value" nameKey="name" outerRadius={90} label={(e)=>`${e.name}`}>
                        {stats.pieData.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={(v:any)=>cur(Number(v))} contentStyle={{ background:"hsl(var(--card))", border:"1px solid hsl(var(--border))", borderRadius:8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent></Card>
          </div>

          {/* AI insight */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl gradient-bg-primary text-white flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">{bn?"AI ফিন্যান্স কোচ":"AI Finance Coach"}</h3>
                    <p className="text-[11px] text-muted-foreground">{bn?"আপনার ডেটা দেখে স্মার্ট পরামর্শ":"Smart tips from your data"}</p>
                  </div>
                </div>
                <Button onClick={askAI} disabled={insightBusy} size="sm" className="gradient-bg-primary text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {insightBusy ? (bn?"ভাবছে...":"Thinking...") : (bn?"পরামর্শ নিন":"Get advice")}
                </Button>
              </div>
              {insight && (
                <div className="mt-2 p-4 rounded-xl bg-background/70 border border-border/60 whitespace-pre-wrap text-sm leading-relaxed">
                  {insight}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSACTIONS */}
        <TabsContent value="tx" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <h3 className="font-display font-bold">{bn?"নতুন লেনদেন":"New Transaction"}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <Select value={tx.type} onValueChange={(v:any)=>setTx({...tx, type:v, category:""})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">{bn?"ব্যয়":"Expense"}</SelectItem>
                  <SelectItem value="income">{bn?"আয়":"Income"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tx.category} onValueChange={(v)=>setTx({...tx, category:v})}>
                <SelectTrigger><SelectValue placeholder={bn?"ক্যাটেগরি":"Category"} /></SelectTrigger>
                <SelectContent>
                  {(tx.type==="expense"?expCats:incCats).map(c=>(<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder={bn?"৳ পরিমাণ":"Amount"} value={tx.amount} onChange={e=>setTx({...tx, amount:e.target.value})} />
              <Input type="date" value={tx.occurred_on} onChange={e=>setTx({...tx, occurred_on:e.target.value})} />
              <Button onClick={addTx} className="gradient-bg-primary text-white"><Plus className="w-4 h-4 mr-1" />{bn?"যোগ":"Add"}</Button>
            </div>
            <Textarea placeholder={bn?"নোট (ঐচ্ছিক)":"Note (optional)"} value={tx.note} onChange={e=>setTx({...tx, note:e.target.value})} maxLength={300} />
          </CardContent></Card>

          <Card><CardContent className="p-0">
            <div className="max-h-[500px] overflow-auto divide-y divide-border">
              {txs.length===0 && <div className="p-6 text-center text-sm text-muted-foreground">{bn?"কোনো লেনদেন নেই":"No transactions yet"}</div>}
              {txs.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-muted/40">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type==="income"?"bg-emerald-500/15 text-emerald-600":"bg-rose-500/15 text-rose-600"}`}>
                    {t.type==="income"?<TrendingUp className="w-4 h-4" />:<TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{t.category}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{t.occurred_on}{t.note?` • ${t.note}`:""}</div>
                  </div>
                  <div className={`font-display font-bold ${t.type==="income"?"text-emerald-600":"text-rose-600"}`}>
                    {t.type==="income"?"+":"−"}{cur(t.amount)}
                  </div>
                  <Button size="icon" variant="ghost" onClick={()=>delTx(t.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* DEBTS */}
        {/* PLANNED PURCHASES */}
        <TabsContent value="plans" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display font-bold flex items-center gap-2"><ShoppingCart className="w-4 h-4" />{bn?"এই মাসে কী কিনবেন":"What to buy this month"}</h3>
              <Badge variant="outline">{bn?"মোট পরিকল্পিত":"Planned total"}: {cur(planTotal)}</Badge>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <Input placeholder={bn?"আইটেম":"Item"} value={plan.item} onChange={e=>setPlan({...plan, item:e.target.value})} maxLength={80} />
              <Input type="number" placeholder={bn?"৳ আনুমানিক":"Est. price"} value={plan.est_price} onChange={e=>setPlan({...plan, est_price:e.target.value})} />
              <Select value={plan.priority} onValueChange={(v)=>setPlan({...plan, priority:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{bn?"জরুরি":"High"}</SelectItem>
                  <SelectItem value="medium">{bn?"মাঝারি":"Medium"}</SelectItem>
                  <SelectItem value="low">{bn?"কম":"Low"}</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={plan.plan_date} onChange={e=>setPlan({...plan, plan_date:e.target.value})} />
              <Button onClick={addPlan} className="gradient-bg-primary text-white"><Plus className="w-4 h-4 mr-1" />{bn?"যোগ":"Add"}</Button>
            </div>
            <Textarea placeholder={bn?"নোট (ঐচ্ছিক)":"Note (optional)"} value={plan.note} onChange={e=>setPlan({...plan, note:e.target.value})} maxLength={300} />
          </CardContent></Card>

          <Card><CardContent className="p-0">
            <div className="divide-y divide-border max-h-[500px] overflow-auto">
              {plans.length===0 && <div className="p-6 text-center text-sm text-muted-foreground">{bn?"কোনো পরিকল্পনা নেই":"No plans yet"}</div>}
              {plans.map(p=>(
                <div key={p.id} className={`p-3 flex items-center gap-3 ${p.is_done?"opacity-60":""}`}>
                  <Button size="icon" variant={p.is_done?"default":"outline"} className="w-8 h-8 shrink-0" onClick={()=>togglePlanDone(p)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${p.is_done?"line-through":""}`}>{p.item}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {p.plan_date || (bn?"যে কোনো সময়":"Anytime")}
                      {p.note?` • ${p.note}`:""}
                    </div>
                  </div>
                  <Badge variant={p.priority==="high"?"destructive":p.priority==="low"?"outline":"secondary"} className="text-[10px]">
                    {p.priority==="high"?(bn?"জরুরি":"High"):p.priority==="low"?(bn?"কম":"Low"):(bn?"মাঝারি":"Med")}
                  </Badge>
                  <div className="font-display font-bold">{cur(Number(p.est_price))}</div>
                  <Button size="icon" variant="ghost" onClick={()=>delPlan(p.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                </div>
              ))}
            </div>
          </CardContent></Card>

          {plans.length>0 && (
            <Card className="border-primary/30 bg-primary/5"><CardContent className="p-4 text-sm">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div><span className="font-semibold">{bn?"নেট হিসাব":"Net check"}:</span> {bn?"এই মাসের আয়":"This month income"} {cur(stats.income)} − {bn?"পরিকল্পিত":"Planned"} {cur(planTotal)} = <span className={`font-display font-bold ${stats.income-planTotal>=0?"text-emerald-600":"text-rose-600"}`}>{cur(stats.income-planTotal)}</span></div>
                {stats.income-planTotal < 0 && <Badge variant="destructive">{bn?"বাজেট ছাড়িয়ে গেছে":"Over income"}</Badge>}
              </div>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* SELLABLE ASSETS */}
        <TabsContent value="assets" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display font-bold flex items-center gap-2"><Package className="w-4 h-4" />{bn?"বিক্রয়যোগ্য সম্পদ":"Sellable items"}</h3>
              <Badge variant="outline">{bn?"মোট আনুমানিক মূল্য":"Est. liquid value"}: {cur(assetTotal)}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{bn?"আপনার কাছে যে প্রোডাক্টগুলো আছে—দরকার হলে বিক্রি করে খরচ মেটাতে পারবেন":"Things you own and could sell to cover expenses if needed"}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Input placeholder={bn?"আইটেম (যেমন: পুরাতন ফোন)":"Item (e.g. old phone)"} value={asset.item} onChange={e=>setAsset({...asset, item:e.target.value})} maxLength={80} />
              <Input type="number" placeholder={bn?"৳ আনুমানিক মূল্য":"Est. value"} value={asset.est_value} onChange={e=>setAsset({...asset, est_value:e.target.value})} />
              <Select value={asset.condition} onValueChange={(v)=>setAsset({...asset, condition:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{bn?"নতুনের মতো":"Like new"}</SelectItem>
                  <SelectItem value="good">{bn?"ভালো":"Good"}</SelectItem>
                  <SelectItem value="fair">{bn?"মোটামুটি":"Fair"}</SelectItem>
                  <SelectItem value="poor">{bn?"পুরাতন":"Poor"}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addAsset} className="gradient-bg-primary text-white"><Plus className="w-4 h-4 mr-1" />{bn?"যোগ":"Add"}</Button>
            </div>
            <Textarea placeholder={bn?"নোট (ব্র্যান্ড, কোথায় বিক্রি করবেন)":"Note (brand, where to sell)"} value={asset.note} onChange={e=>setAsset({...asset, note:e.target.value})} maxLength={300} />
          </CardContent></Card>

          <Card><CardContent className="p-0">
            <div className="divide-y divide-border max-h-[500px] overflow-auto">
              {assets.length===0 && <div className="p-6 text-center text-sm text-muted-foreground">{bn?"কোনো আইটেম যোগ করা হয়নি":"No items added"}</div>}
              {assets.map(a=>(
                <div key={a.id} className={`p-3 flex items-center gap-3 ${a.is_sold?"opacity-60":""}`}>
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-600 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${a.is_sold?"line-through":""}`}>{a.item}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {a.condition}{a.note?` • ${a.note}`:""}
                      {a.is_sold && a.sold_amount!=null ? ` • ${bn?"বিক্রি":"Sold"}: ${cur(Number(a.sold_amount))}` : ""}
                    </div>
                  </div>
                  <div className="font-display font-bold">{cur(Number(a.est_value))}</div>
                  {!a.is_sold && <Button size="sm" variant="outline" onClick={()=>markAssetSold(a)}>{bn?"বিক্রি":"Sold"}</Button>}
                  {a.is_sold && <Badge variant="secondary">{bn?"বিক্রিত":"Sold"}</Badge>}
                  <Button size="icon" variant="ghost" onClick={()=>delAsset(a.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                </div>
              ))}
            </div>
          </CardContent></Card>

          {assets.length>0 && stats.net<0 && (
            <Card className="border-amber-500/30 bg-amber-500/5"><CardContent className="p-4 text-sm">
              💡 {bn?`এই মাসে ঘাটতি ${cur(Math.abs(stats.net))}—আপনার সম্পদ থেকে বিক্রি করলে ${cur(assetTotal)} পর্যন্ত পেতে পারেন।`:`Shortfall this month: ${cur(Math.abs(stats.net))}. You could raise up to ${cur(assetTotal)} from your assets.`}
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="debts" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <h3 className="font-display font-bold">{bn?"ধার যোগ করুন":"Add Debt"}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <Select value={debt.direction} onValueChange={(v:any)=>setDebt({...debt, direction:v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lent">{bn?"আমি দিয়েছি":"I lent"}</SelectItem>
                  <SelectItem value="borrowed">{bn?"আমি নিয়েছি":"I borrowed"}</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder={bn?"কার সাথে":"Who"} value={debt.counterparty} onChange={e=>setDebt({...debt, counterparty:e.target.value})} maxLength={80} />
              <Input type="number" placeholder={bn?"৳":"Amount"} value={debt.amount} onChange={e=>setDebt({...debt, amount:e.target.value})} />
              <Input type="date" value={debt.due_date} onChange={e=>setDebt({...debt, due_date:e.target.value})} />
              <Button onClick={addDebt} className="gradient-bg-primary text-white"><Plus className="w-4 h-4 mr-1" />{bn?"যোগ":"Add"}</Button>
            </div>
            <Textarea placeholder={bn?"নোট":"Note"} value={debt.note} onChange={e=>setDebt({...debt, note:e.target.value})} maxLength={300} />
          </CardContent></Card>

          <Card><CardContent className="p-0">
            <div className="divide-y divide-border max-h-[500px] overflow-auto">
              {debts.length===0 && <div className="p-6 text-center text-sm text-muted-foreground">{bn?"কোনো ধার নেই":"No debts"}</div>}
              {debts.map(d=>(
                <div key={d.id} className="p-3 flex items-center gap-3">
                  <Badge className={d.direction==="lent"?"bg-emerald-500/15 text-emerald-700 border-emerald-300":"bg-rose-500/15 text-rose-700 border-rose-300"}>
                    {d.direction==="lent"?(bn?"পাবো":"Receivable"):(bn?"দিবো":"Payable")}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{d.counterparty}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {bn?"বাকি":"Outstanding"}: {cur(d.amount-d.paid_amount)}{d.due_date?` • ${bn?"নির্ধারিত":"Due"}: ${d.due_date}`:""}
                    </div>
                  </div>
                  {!d.is_settled && (
                    <Button size="sm" variant="outline" onClick={()=>settleDebt(d)}>{bn?"পরিশোধ":"Settle"}</Button>
                  )}
                  {d.is_settled && <Badge variant="secondary">{bn?"পরিশোধিত":"Settled"}</Badge>}
                  <Button size="icon" variant="ghost" onClick={()=>delDebt(d.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* BUDGETS */}
        <TabsContent value="budget" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <h3 className="font-display font-bold">{bn?"মাসিক বাজেট সেট করুন":"Set Monthly Budget"}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              <Select value={budget.category} onValueChange={(v)=>setBudget({...budget, category:v})}>
                <SelectTrigger><SelectValue placeholder={bn?"ক্যাটেগরি":"Category"} /></SelectTrigger>
                <SelectContent>{expCats.map(c=>(<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
              </Select>
              <Input type="number" placeholder={bn?"৳ মাসিক লিমিট":"Monthly limit"} value={budget.monthly_limit} onChange={e=>setBudget({...budget, monthly_limit:e.target.value})} />
              <Button onClick={addBudget} className="gradient-bg-primary text-white"><Save className="w-4 h-4 mr-1" />{bn?"সংরক্ষণ":"Save"}</Button>
            </div>
          </CardContent></Card>

          <div className="grid sm:grid-cols-2 gap-3">
            {budgets.length===0 && <div className="p-6 text-center text-sm text-muted-foreground col-span-2">{bn?"কোনো বাজেট নেই":"No budgets"}</div>}
            {budgets.map(b=>{
              const used = monthExpByCat[b.category]||0;
              const pct = Math.min(100, Math.round((used/b.monthly_limit)*100));
              const over = used > b.monthly_limit;
              return (
                <Card key={b.id}><CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{b.category}</div>
                      <div className="text-[11px] text-muted-foreground">{cur(used)} / {cur(b.monthly_limit)}</div>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={over?"destructive":pct>=80?"secondary":"outline"}>{pct}%</Badge>
                      <Button size="icon" variant="ghost" onClick={()=>delBudget(b.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                    </div>
                  </div>
                  <Progress value={pct} className={over?"[&>div]:bg-destructive":""} />
                  {over && <p className="text-xs text-destructive mt-1.5 font-semibold">⚠ {bn?"লিমিট পার হয়ে গেছে":"Over budget!"}</p>}
                </CardContent></Card>
              );
            })}
          </div>
        </TabsContent>

        {/* GOALS */}
        <TabsContent value="goals" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <h3 className="font-display font-bold">{bn?"নতুন সঞ্চয় লক্ষ্য":"New Savings Goal"}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              <Input placeholder={bn?"লক্ষ্যের নাম":"Goal title"} value={goal.title} onChange={e=>setGoal({...goal, title:e.target.value})} maxLength={80} />
              <Input type="number" placeholder={bn?"৳ লক্ষ্য":"Target amount"} value={goal.target_amount} onChange={e=>setGoal({...goal, target_amount:e.target.value})} />
              <Input type="date" value={goal.target_date} onChange={e=>setGoal({...goal, target_date:e.target.value})} />
              <Button onClick={addGoal} className="gradient-bg-primary text-white"><Target className="w-4 h-4 mr-1" />{bn?"যোগ":"Add"}</Button>
            </div>
          </CardContent></Card>

          <div className="grid sm:grid-cols-2 gap-3">
            {goals.length===0 && <div className="p-6 text-center text-sm text-muted-foreground col-span-2">{bn?"কোনো লক্ষ্য নেই":"No goals"}</div>}
            {goals.map(g=>{
              const pct = Math.min(100, Math.round((g.saved_amount/g.target_amount)*100));
              return (
                <Card key={g.id}><CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{g.title}</div>
                      <div className="text-[11px] text-muted-foreground">{cur(g.saved_amount)} / {cur(g.target_amount)}{g.target_date?` • ${g.target_date}`:""}</div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={()=>delGoal(g.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                  </div>
                  <Progress value={pct} />
                  <div className="flex gap-1 pt-1">
                    {[100,500,1000,5000].map(v=>(
                      <Button key={v} size="sm" variant="outline" className="text-xs flex-1" onClick={()=>addToGoal(g, v)}>+{v}</Button>
                    ))}
                  </div>
                </CardContent></Card>
              );
            })}
          </div>
        </TabsContent>

        {/* PROFILE */}
        <TabsContent value="profile" className="mt-4">
          <Card><CardContent className="p-5 space-y-3 max-w-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center"><UserIcon className="w-6 h-6" /></div>
              <div>
                <h3 className="font-display font-bold">{bn?"প্রোফাইল":"Profile"}</h3>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div>
              <Label>{bn?"পুরো নাম":"Full name"}</Label>
              <Input value={profile?.full_name || ""} onChange={e=>setProfile(p=>p?{...p, full_name:e.target.value}:p)} maxLength={80} />
            </div>
            <div>
              <Label>{bn?"ফোন":"Phone"}</Label>
              <Input value={profile?.phone || ""} onChange={e=>setProfile(p=>p?{...p, phone:e.target.value}:p)} maxLength={20} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{bn?"মাসিক আয় (লক্ষ্য)":"Monthly income (target)"}</Label>
                <Input type="number" value={profile?.monthly_income || 0} onChange={e=>setProfile(p=>p?{...p, monthly_income:Math.round(Number(e.target.value)||0)}:p)} />
              </div>
              <div>
                <Label>{bn?"মুদ্রা":"Currency"}</Label>
                <Select value={profile?.currency || "BDT"} onValueChange={(v)=>setProfile(p=>p?{...p, currency:v}:p)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">BDT (৳)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={saveProfile} className="gradient-bg-primary text-white">
              <Save className="w-4 h-4 mr-2" /> {bn?"সংরক্ষণ":"Save"}
            </Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
