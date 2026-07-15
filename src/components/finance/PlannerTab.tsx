import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Target, TrendingUp, CalendarClock, Sparkles, Trash2, CheckCircle2, AlertTriangle, Calculator, Wallet, PiggyBank, Loader2, Banknote, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import FinanceCalculator from "./FinanceCalculator";
import { PlanCountdown } from "./PlanCountdown";


type Kind = "savings" | "income_target" | "installment" | "debt_payoff";
type Scope = "personal" | "business";

interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  kind: Kind;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  monthly_contribution: number;
  months_total: number | null;
  months_paid: number;
  interest_rate: number;
  priority: number;
  scope: Scope;
  note: string | null;
  is_completed: boolean;
  icon: string | null;
}

const fmtBDT = (n: number, bn = false) => {
  const abs = Math.abs(Math.round(n));
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(abs);
  return `${n < 0 ? "-" : ""}৳${s}`;
};

const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const monthsUntil = (dateStr: string | null): number | null => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(0, months);
};

interface Props {
  userId: string;
  bn: boolean;
  monthlyIncome: number;   // this-month actual income
  monthlyExpense: number;  // this-month actual expense
  totalBalance: number;    // sum of wallet balances
  wallets?: Array<{ id: string; name: string; scope: string; balance: number }>;
  onPaid?: () => void;
}

const emptyDraft = (): Partial<GoalRow> => ({
  title: "",
  kind: "savings",
  target_amount: 0,
  saved_amount: 0,
  monthly_contribution: 0,
  target_date: null,
  months_total: null,
  months_paid: 0,
  interest_rate: 0,
  priority: 2,
  scope: "personal",
  note: "",
  is_completed: false,
});

export const PlannerTab = ({ userId, bn, monthlyIncome, monthlyExpense, totalBalance, wallets = [], onPaid }: Props) => {
  const [rows, setRows] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"summary" | "savings" | "income_target" | "installment" | "debt_payoff" | "pay" | "calc">("summary");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<GoalRow>>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payWallet, setPayWallet] = useState<Record<string, string>>({});
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", userId)
      .order("is_completed", { ascending: true })
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [userId]);

  const savings = rows.filter(r => r.kind === "savings");
  const incomeTargets = rows.filter(r => r.kind === "income_target");
  const installments = rows.filter(r => r.kind === "installment");

  // ---- Smart month summary ----
  const summary = useMemo(() => {
    const emiThisMonth = installments
      .filter(i => !i.is_completed)
      .reduce((s, i) => s + (i.monthly_contribution || 0), 0);
    const savingsThisMonth = savings
      .filter(i => !i.is_completed)
      .reduce((s, i) => {
        if (i.monthly_contribution) return s + i.monthly_contribution;
        const m = monthsUntil(i.target_date);
        const remain = Math.max(0, i.target_amount - i.saved_amount);
        if (m && m > 0) return s + Math.ceil(remain / m);
        return s;
      }, 0);
    const activeIncomeTarget = incomeTargets.find(i => !i.is_completed);
    const incomeGoal = activeIncomeTarget?.target_amount ?? 0;
    const needThisMonth = emiThisMonth + savingsThisMonth + monthlyExpense;
    const gap = needThisMonth - monthlyIncome;
    return { emiThisMonth, savingsThisMonth, needThisMonth, incomeGoal, gap, activeIncomeTarget };
  }, [installments, savings, incomeTargets, monthlyExpense, monthlyIncome]);

  const startNew = (kind: Kind) => {
    setEditingId(null);
    setDraft({ ...emptyDraft(), kind });
    setOpen(true);
  };
  const startEdit = (r: GoalRow) => {
    setEditingId(r.id);
    setDraft({ ...r });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.title?.trim()) return toast.error(bn ? "নাম দিন" : "Title required");
    if (!draft.target_amount || draft.target_amount <= 0) return toast.error(bn ? "টার্গেট এমাউন্ট দিন" : "Enter target");
    const payload: any = {
      user_id: userId,
      title: draft.title.trim(),
      kind: draft.kind ?? "savings",
      target_amount: Math.round(draft.target_amount || 0),
      saved_amount: Math.round(draft.saved_amount || 0),
      monthly_contribution: Math.round(draft.monthly_contribution || 0),
      target_date: draft.target_date || null,
      months_total: draft.months_total || null,
      months_paid: draft.months_paid || 0,
      interest_rate: draft.interest_rate || 0,
      priority: draft.priority ?? 2,
      scope: draft.scope ?? "personal",
      note: draft.note?.toString().trim() || null,
      is_completed: !!draft.is_completed,
    };
    const q = editingId
      ? supabase.from("savings_goals").update(payload).eq("id", editingId)
      : supabase.from("savings_goals").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success(bn ? "সংরক্ষিত" : "Saved");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(bn ? "মুছে ফেলবেন?" : "Delete?")) return;
    const { error } = await supabase.from("savings_goals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const addContribution = async (r: GoalRow, amount: number) => {
    if (!amount) return;
    const update: any = { saved_amount: (r.saved_amount || 0) + amount };
    if (r.kind === "installment") {
      update.months_paid = (r.months_paid || 0) + 1;
      if (r.months_total && update.months_paid >= r.months_total) update.is_completed = true;
    }
    if (update.saved_amount >= r.target_amount) update.is_completed = true;
    const { error } = await supabase.from("savings_goals").update(update).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(bn ? "যোগ হয়েছে" : "Added");
    load();
  };

  const payInstallment = async (r: GoalRow, walletId: string, amount: number) => {
    if (!walletId) return toast.error(bn ? "ওয়ালেট নির্বাচন করুন" : "Select a wallet");
    if (!amount || amount <= 0) return toast.error(bn ? "সঠিক টাকা লিখুন" : "Enter amount");
    setPayingId(r.id);
    const now = new Date().toISOString();
    const { error: txErr } = await supabase.from("finance_transactions").insert({
      user_id: userId,
      wallet_id: walletId,
      type: "expense",
      amount,
      category: "installment",
      scope: (r.scope === "business" ? "business" : "personal") as any,
      note: `${bn ? "কিস্তি" : "EMI"}: ${r.title}`,
      occurred_at: now,
    } as any);
    if (txErr) { setPayingId(null); return toast.error(txErr.message); }
    const nextPaid = (r.months_paid || 0) + 1;
    const nextSaved = (r.saved_amount || 0) + amount;
    const update: any = { months_paid: nextPaid, saved_amount: nextSaved };
    if ((r.months_total && nextPaid >= r.months_total) || nextSaved >= r.target_amount) update.is_completed = true;
    await supabase.from("savings_goals").update(update).eq("id", r.id);
    setPayingId(null);
    toast.success(bn ? "কিস্তি পরিশোধ ও ওয়ালেট থেকে বাদ" : "EMI paid & deducted");
    load();
    onPaid?.();
  };

  const kindLabel = (k: Kind) =>
    bn
      ? (k === "savings" ? "লক্ষ্য" : k === "income_target" ? "আয়ের টার্গেট" : k === "debt_payoff" ? "ধার শোধ" : "কিস্তি")
      : (k === "savings" ? "Goal" : k === "income_target" ? "Income Target" : k === "debt_payoff" ? "Debt Payoff" : "Installment");

  const priorityMeta = (p: number) => {
    if (p >= 3) return { label: bn ? "উচ্চ" : "High", cls: "bg-rose-500/15 text-rose-600 border-rose-500/30" };
    if (p <= 1) return { label: bn ? "কম" : "Low", cls: "bg-slate-500/15 text-slate-500 border-slate-500/30" };
    return { label: bn ? "মাঝারি" : "Medium", cls: "bg-amber-500/15 text-amber-600 border-amber-500/30" };
  };

  const setPriority = async (r: GoalRow, p: number) => {
    const { error } = await supabase.from("savings_goals").update({ priority: p }).eq("id", r.id);
    if (error) return toast.error(error.message);
    setRows(prev => prev.map(x => x.id === r.id ? { ...x, priority: p } : x).sort((a, b) => Number(a.is_completed) - Number(b.is_completed) || b.priority - a.priority));
    toast.success(bn ? "গুরুত্ব আপডেট" : "Priority updated");
  };


  const GoalCard = ({ r }: { r: GoalRow }) => {
    const remaining = Math.max(0, r.target_amount - r.saved_amount);
    const pct = r.target_amount ? Math.min(100, Math.round((r.saved_amount / r.target_amount) * 100)) : 0;
    const monthsLeft = monthsUntil(r.target_date);
    const perMonth =
      r.monthly_contribution ||
      (monthsLeft && monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining);

    return (
      <Card className={cn("p-4 space-y-3", r.is_completed && "opacity-60")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{r.title}</p>
              <Badge variant="outline" className={cn("text-[10px]", priorityMeta(r.priority).cls)}>★ {priorityMeta(r.priority).label}</Badge>
              <Badge variant="outline" className="text-[10px]">{bn ? (r.scope === "business" ? "ব্যবসা" : "ব্যক্তিগত") : r.scope}</Badge>
              {r.is_completed && <Badge className="text-[10px] bg-emerald-500/20 text-emerald-600 border-0"><CheckCircle2 className="h-3 w-3 mr-1" />{bn ? "সম্পন্ন" : "Done"}</Badge>}
            </div>
            {r.note && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.note}</p>}
            {r.target_date && (
              <div className="mt-1.5">
                <PlanCountdown targetDate={r.target_date} bn={bn} label={bn ? "বাকি:" : "In:"} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(r)} aria-label="edit"><CalendarClock className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500" onClick={() => remove(r.id)} aria-label="delete"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="tabular-nums font-medium">{fmtBDT(r.saved_amount, bn)} / {fmtBDT(r.target_amount, bn)}</span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-muted-foreground">{bn ? "বাকি" : "Remaining"}</p>
            <p className="font-semibold tabular-nums">{fmtBDT(remaining, bn)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-muted-foreground">{bn ? "মাসে" : "Per month"}</p>
            <p className="font-semibold tabular-nums">{fmtBDT(perMonth, bn)}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-muted-foreground">
              {r.kind === "installment" ? (bn ? "কিস্তি" : "EMI") : (bn ? "সময়" : "Time")}
            </p>
            <p className="font-semibold tabular-nums">
              {r.kind === "installment" && r.months_total
                ? `${r.months_paid}/${r.months_total}`
                : monthsLeft !== null
                  ? `${monthsLeft}${bn ? "মাস" : "mo"}`
                  : "—"}
            </p>
          </div>
        </div>

        {r.kind === "debt_payoff" && !r.is_completed && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground mr-0.5">{bn ? "গুরুত্ব:" : "Priority:"}</span>
            {[3, 2, 1].map(p => {
              const meta = priorityMeta(p);
              const active = r.priority === p;
              return (
                <button
                  key={p}
                  onClick={() => setPriority(r, p)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] border transition",
                    active ? meta.cls + " font-semibold" : "border-border/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        )}

        {!r.is_completed && (
          <div className="flex items-center gap-2 pt-1">
            <Input
              type="number"
              placeholder={bn ? "পরিশোধ/জমা" : "Add contribution"}
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = +(e.currentTarget.value || 0);
                  if (v > 0) { addContribution(r, v); e.currentTarget.value = ""; }
                }
              }}
            />
            <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => addContribution(r, perMonth)}>
              +{fmtBDT(perMonth, bn)}
            </Button>
          </div>
        )}
      </Card>
    );
  };

  if (loading) return <div className="grid place-items-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar gap-1 bg-muted/60 h-10 px-1">
          <TabsTrigger value="summary" className="text-xs px-3 shrink-0"><Sparkles className="h-3.5 w-3.5 mr-1" />{bn ? "সারসংক্ষেপ" : "Overview"}</TabsTrigger>
          <TabsTrigger value="savings" className="text-xs px-3 shrink-0"><Target className="h-3.5 w-3.5 mr-1" />{bn ? "লক্ষ্য" : "Goals"}</TabsTrigger>
          <TabsTrigger value="income_target" className="text-xs px-3 shrink-0"><TrendingUp className="h-3.5 w-3.5 mr-1" />{bn ? "আয় টার্গেট" : "Income"}</TabsTrigger>
          <TabsTrigger value="installment" className="text-xs px-3 shrink-0"><CalendarClock className="h-3.5 w-3.5 mr-1" />{bn ? "কিস্তি" : "EMI"}</TabsTrigger>
          <TabsTrigger value="debt_payoff" className="text-xs px-3 shrink-0"><HandCoins className="h-3.5 w-3.5 mr-1" />{bn ? "ধার শোধ" : "Debt Payoff"}</TabsTrigger>
          <TabsTrigger value="pay" className="text-xs px-3 shrink-0"><Banknote className="h-3.5 w-3.5 mr-1" />{bn ? "কিস্তি পরিশোধ" : "Pay EMI"}</TabsTrigger>

        </TabsList>

        {/* ---- Summary ---- */}
        <TabsContent value="summary" className="mt-4 space-y-3">
          <Card className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">{bn ? "এই মাসের স্মার্ট প্ল্যান" : "This Month's Smart Plan"}</p>
              <Badge variant="outline" className="ml-auto text-[10px]">{monthKey()}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-background/60 p-2.5">
                <p className="text-muted-foreground text-[10px]">{bn ? "আয় (এই মাস)" : "Income (mo)"}</p>
                <p className="font-semibold tabular-nums text-emerald-500">{fmtBDT(monthlyIncome, bn)}</p>
              </div>
              <div className="rounded-lg bg-background/60 p-2.5">
                <p className="text-muted-foreground text-[10px]">{bn ? "খরচ (এই মাস)" : "Expense (mo)"}</p>
                <p className="font-semibold tabular-nums text-rose-500">{fmtBDT(monthlyExpense, bn)}</p>
              </div>
              <div className="rounded-lg bg-background/60 p-2.5">
                <p className="text-muted-foreground text-[10px]">{bn ? "কিস্তি বাধ্যতামূলক" : "EMI due"}</p>
                <p className="font-semibold tabular-nums">{fmtBDT(summary.emiThisMonth, bn)}</p>
              </div>
              <div className="rounded-lg bg-background/60 p-2.5">
                <p className="text-muted-foreground text-[10px]">{bn ? "লক্ষ্যের জন্য বরাদ্দ" : "Allocate for goals"}</p>
                <p className="font-semibold tabular-nums">{fmtBDT(summary.savingsThisMonth, bn)}</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-background/80 p-3 border border-border/50">
              <p className="text-[11px] text-muted-foreground">{bn ? "এই মাসে মোট প্রয়োজন" : "Total needed this month"}</p>
              <p className="text-2xl font-bold tabular-nums mt-0.5">{fmtBDT(summary.needThisMonth, bn)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {bn ? "= খরচ + কিস্তি + লক্ষ্যের কিস্তি" : "= expense + EMI + goal savings"}
              </p>

              {summary.gap > 0 ? (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-rose-500">
                      {bn ? "ঘাটতি" : "Shortfall"}: {fmtBDT(summary.gap, bn)}
                    </p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {bn
                        ? `এই মাসে আরও ${fmtBDT(summary.gap, bn)} আয় করতে হবে বা খরচ কমাতে হবে।`
                        : `You need ${fmtBDT(summary.gap, bn)} more income or cut expenses.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-500">
                      {bn ? "সবকিছু কভার হচ্ছে" : "On track"} · {fmtBDT(-summary.gap, bn)} {bn ? "উদ্বৃত্ত" : "surplus"}
                    </p>
                  </div>
                </div>
              )}

              {summary.activeIncomeTarget && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{bn ? "আয়ের টার্গেট" : "Income target"}: {fmtBDT(summary.incomeGoal, bn)}</span>
                    <span className="tabular-nums">{Math.min(100, Math.round((monthlyIncome / summary.incomeGoal) * 100))}%</span>
                  </div>
                  <Progress value={Math.min(100, (monthlyIncome / summary.incomeGoal) * 100)} className="h-2" />
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              {bn ? "মোট ব্যালান্স" : "Total balance"}: <b className="tabular-nums text-foreground">{fmtBDT(totalBalance, bn)}</b>
            </div>
          </Card>


          {/* Live countdown for upcoming deadlines */}
          {rows.filter(r => !r.is_completed && r.target_date).length > 0 && (
            <Card className="p-3 border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">{bn ? "আগামী ডেডলাইন" : "Upcoming Deadlines"}</p>
              </div>
              <div className="space-y-1.5">
                {rows
                  .filter(r => !r.is_completed && r.target_date)
                  .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())
                  .slice(0, 5)
                  .map(r => (
                    <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate flex-1">
                        <span className="opacity-60 mr-1">{kindLabel(r.kind)}:</span>
                        {r.title}
                      </span>
                      <PlanCountdown targetDate={r.target_date} bn={bn} />
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Quick preview of active items */}
          {rows.filter(r => !r.is_completed).slice(0, 3).map(r => <GoalCard key={r.id} r={r} />)}
        </TabsContent>


        {(["savings", "income_target", "installment", "debt_payoff"] as Kind[]).map(k => (
          <TabsContent key={k} value={k} className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{kindLabel(k)}</p>
              <Button size="sm" onClick={() => startNew(k)}><Plus className="h-3.5 w-3.5 mr-1" />{bn ? "যোগ" : "Add"}</Button>
            </div>
            {rows.filter(r => r.kind === k).length === 0 ? (
              <Card className="p-8 text-center">
                <PiggyBank className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  {bn ? "এখনো কিছু যোগ করা হয়নি" : "Nothing added yet"}
                </p>
              </Card>
            ) : (
              rows.filter(r => r.kind === k).map(r => <GoalCard key={r.id} r={r} />)
            )}
          </TabsContent>
        ))}

        {/* ---- Pay EMI: deducts from a chosen wallet ---- */}
        <TabsContent value="pay" className="mt-4 space-y-3">
          <Card className="p-3 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold">{bn ? "কিস্তি পরিশোধ" : "Pay installment"}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {bn
                ? "যে ওয়ালেট থেকে টাকা কাটবে সেটা বাছাই করে পরিশোধ চাপুন — খরচ হিসেবে বাদ যাবে ও কিস্তি এগিয়ে যাবে।"
                : "Pick the wallet to deduct from, then Pay — an expense is logged and the installment advances."}
            </p>
          </Card>

          {installments.filter(i => !i.is_completed).length === 0 ? (
            <Card className="p-8 text-center">
              <CalendarClock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                {bn ? "সক্রিয় কোনো কিস্তি নেই" : "No active installments"}
              </p>
              <Button size="sm" className="mt-3" onClick={() => startNew("installment")}>
                <Plus className="h-3.5 w-3.5 mr-1" />{bn ? "কিস্তি যোগ" : "Add EMI"}
              </Button>
            </Card>
          ) : (
            installments.filter(i => !i.is_completed).map(r => {
              const amt = r.monthly_contribution || (r.months_total ? Math.ceil(Math.max(0, r.target_amount - r.saved_amount) / Math.max(1, (r.months_total - r.months_paid))) : 0);
              const scopedWallets = wallets.filter(w => w.scope === r.scope);
              const wid = payWallet[r.id] || "";
              return (
                <Card key={r.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {r.months_total ? `${r.months_paid}/${r.months_total} ${bn ? "মাস" : "mo"}` : ""}
                        {r.interest_rate ? ` · ${r.interest_rate}%` : ""}
                      </p>
                      {r.target_date && (
                        <div className="mt-1"><PlanCountdown targetDate={r.target_date} bn={bn} label={bn ? "শেষ:" : "Ends:"} /></div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {bn ? (r.scope === "business" ? "ব্যবসা" : "ব্যক্তিগত") : r.scope}
                    </Badge>
                  </div>


                  <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                    <div>
                      <Label className="text-[11px]">{bn ? "ওয়ালেট" : "Wallet"}</Label>
                      <Select value={wid} onValueChange={(v) => setPayWallet(p => ({ ...p, [r.id]: v }))}>
                        <SelectTrigger className="h-9 mt-1"><SelectValue placeholder={bn ? "ওয়ালেট বাছুন" : "Choose wallet"} /></SelectTrigger>
                        <SelectContent>
                          {scopedWallets.length === 0 && <SelectItem value="__none" disabled>{bn ? "কোনো ওয়ালেট নেই" : "No wallet"}</SelectItem>}
                          {scopedWallets.map(w => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name} · {fmtBDT(w.balance, bn)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px]">{bn ? "টাকা" : "Amount"}</Label>
                      <Input
                        type="number"
                        className="h-9 mt-1 w-28 tabular-nums"
                        defaultValue={amt || ""}
                        onChange={(e) => (r as any)._payAmt = +e.target.value || 0}
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    disabled={payingId === r.id || !wid}
                    onClick={() => payInstallment(r, wid, (r as any)._payAmt || amt)}
                  >
                    {payingId === r.id
                      ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />{bn ? "প্রসেসিং" : "Processing"}</>
                      : <><Banknote className="h-3.5 w-3.5 mr-1" />{bn ? `পরিশোধ ${fmtBDT((r as any)._payAmt || amt, bn)}` : `Pay ${fmtBDT((r as any)._payAmt || amt, bn)}`}</>}
                  </Button>
                </Card>
              );
            })
          )}
        </TabsContent>

      </Tabs>

      {/* Add/edit sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>
              {editingId ? (bn ? "সম্পাদনা" : "Edit") : (bn ? "নতুন যোগ" : "New")} · {kindLabel(draft.kind as Kind)}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">{bn ? "ধরন" : "Type"}</Label>
              <Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v as Kind })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">{bn ? "🎯 লক্ষ্য (যেকোনো উদ্দেশ্য)" : "🎯 Goal (any purpose)"}</SelectItem>
                  <SelectItem value="income_target">{bn ? "📈 আয়ের টার্গেট" : "📈 Income target"}</SelectItem>
                  <SelectItem value="installment">{bn ? "📆 কিস্তি / EMI" : "📆 Installment / EMI"}</SelectItem>
                  <SelectItem value="debt_payoff">{bn ? "🤝 ধার শোধ" : "🤝 Debt Payoff"}</SelectItem>

                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">{bn ? "নাম" : "Title"}</Label>
              <Input
                className="mt-1"
                placeholder={
                  draft.kind === "savings" ? (bn ? "যেমন: ফ্রিজ কিনতে হবে" : "e.g. Buy fridge") :
                  draft.kind === "income_target" ? (bn ? "যেমন: এই মাসে আয়ের টার্গেট" : "e.g. This month target") :
                  draft.kind === "debt_payoff" ? (bn ? "যেমন: রফিক ভাইয়ের ধার শোধ" : "e.g. Repay loan to Rafik") :
                  (bn ? "যেমন: বাইকের কিস্তি" : "e.g. Bike EMI")
                }

                value={draft.title ?? ""}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">
                  {draft.kind === "income_target" ? (bn ? "টার্গেট আয় (৳)" : "Target income (৳)") :
                   draft.kind === "installment" ? (bn ? "মোট বকেয়া (৳)" : "Total due (৳)") :
                   draft.kind === "debt_payoff" ? (bn ? "মোট ধার (৳)" : "Total debt (৳)") :
                   (bn ? "টার্গেট (৳)" : "Target (৳)")}
                </Label>
                <Input type="number" className="mt-1" value={draft.target_amount ?? 0}
                  onChange={(e) => setDraft({ ...draft, target_amount: +e.target.value || 0 })} />
              </div>
              <div>
                <Label className="text-xs">
                  {draft.kind === "installment" ? (bn ? "পরিশোধিত (৳)" : "Paid (৳)") :
                   draft.kind === "debt_payoff" ? (bn ? "শোধ করা (৳)" : "Repaid (৳)") :
                   (bn ? "অগ্রগতি (৳)" : "Progress (৳)")}
                </Label>
                <Input type="number" className="mt-1" value={draft.saved_amount ?? 0}
                  onChange={(e) => setDraft({ ...draft, saved_amount: +e.target.value || 0 })} />
              </div>

            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">
                  {draft.kind === "installment" ? (bn ? "মাসিক কিস্তি (৳)" : "Monthly EMI (৳)") : (bn ? "মাসিক বরাদ্দ (৳)" : "Monthly (৳)")}
                </Label>
                <Input type="number" className="mt-1" value={draft.monthly_contribution ?? 0}
                  onChange={(e) => setDraft({ ...draft, monthly_contribution: +e.target.value || 0 })} />
              </div>
              <div>
                <Label className="text-xs">{bn ? "টার্গেট তারিখ" : "Target date"}</Label>
                <Input type="date" className="mt-1" value={draft.target_date ?? ""}
                  onChange={(e) => setDraft({ ...draft, target_date: e.target.value || null })} />
              </div>
            </div>

            {draft.kind === "installment" && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">{bn ? "মোট মাস" : "Total months"}</Label>
                  <Input type="number" className="mt-1" value={draft.months_total ?? ""}
                    onChange={(e) => setDraft({ ...draft, months_total: +e.target.value || null })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "পরিশোধিত মাস" : "Paid months"}</Label>
                  <Input type="number" className="mt-1" value={draft.months_paid ?? 0}
                    onChange={(e) => setDraft({ ...draft, months_paid: +e.target.value || 0 })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "সুদ (%)" : "Interest (%)"}</Label>
                  <Input type="number" step="0.1" className="mt-1" value={draft.interest_rate ?? 0}
                    onChange={(e) => setDraft({ ...draft, interest_rate: +e.target.value || 0 })} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "স্কোপ" : "Scope"}</Label>
                <Select value={draft.scope} onValueChange={(v) => setDraft({ ...draft, scope: v as Scope })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">{bn ? "ব্যক্তিগত" : "Personal"}</SelectItem>
                    <SelectItem value="business">{bn ? "ব্যবসা" : "Business"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{bn ? "গুরুত্ব" : "Priority"}</Label>
                <Select value={String(draft.priority ?? 2)} onValueChange={(v) => setDraft({ ...draft, priority: +v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">{bn ? "উচ্চ" : "High"}</SelectItem>
                    <SelectItem value="2">{bn ? "মাঝারি" : "Medium"}</SelectItem>
                    <SelectItem value="1">{bn ? "কম" : "Low"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">{bn ? "নোট / কারণ" : "Note / Reason"}</Label>
              <Textarea className="mt-1" rows={2} value={draft.note ?? ""}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder={bn ? "যেমন: বাসায় ফ্রিজ লাগবে" : "e.g. Need a fridge at home"} />
            </div>

            <Button className="w-full" onClick={save}>{bn ? "সংরক্ষণ" : "Save"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
