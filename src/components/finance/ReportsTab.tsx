import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TrendingUp, TrendingDown, AlertTriangle,
  Calendar, CalendarDays, CalendarRange, ArrowUpRight, ArrowDownRight,
  Pencil, Trash2, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "monthly";

interface TxRow {
  id: string;
  type: string;
  amount: number;
  category: string | null;
  scope: string;
  occurred_at: string;
  wallet_id?: string | null;
  note?: string | null;
  party?: string | null;
}
interface SaleRow {
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount: number;
  total_amount: number;
  occurred_at: string;
  delivery_status: string;
}

const INCOME = new Set(["income", "sale", "loan_taken", "repayment_in", "return_in"]);
const EXPENSE = new Set(["expense", "purchase", "loan_given", "repayment_out", "return_out"]);

const fmt = (n: number, bn: boolean) =>
  "৳" + Math.round(n).toLocaleString(bn ? "bn-BD" : "en-BD");

const fmtDateTime = (iso: string, bn: boolean) => {
  const d = new Date(iso);
  return d.toLocaleString(bn ? "bn-BD" : "en-BD", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
};

const startOf = (p: Period) => {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (p === "weekly") d.setDate(d.getDate() - 6);
  else if (p === "monthly") d.setDate(1);
  return d.getTime();
};

export function ReportsTab({
  userId, bn, txs, categoryLabel, onEdit, onDelete,
}: {
  userId: string;
  bn: boolean;
  txs: TxRow[];
  categoryLabel: (c: string) => string;
  onEdit?: (t: TxRow) => void;
  onDelete?: (id: string) => void;
}) {
  const [period, setPeriod] = useState<Period>("daily");
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [drill, setDrill] = useState<{ title: string; rows: TxRow[] } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("finance_sales")
        .select("product_name,quantity,unit_price,cost_price,discount,total_amount,occurred_at,delivery_status")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false });
      setSales((data as SaleRow[]) || []);
    })();
  }, [userId]);

  const from = useMemo(() => startOf(period), [period]);

  const filteredTxs = useMemo(() => txs.filter(t => new Date(t.occurred_at).getTime() >= from), [txs, from]);
  const filteredSales = useMemo(() => sales.filter(s => new Date(s.occurred_at).getTime() >= from), [sales, from]);

  // Yesterday range (only used for daily view)
  const yesterday = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 1);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    return { start: start.getTime(), end: end.getTime() };
  }, []);
  const ydayTxs = useMemo(() => txs.filter(t => {
    const ts = new Date(t.occurred_at).getTime();
    return ts >= yesterday.start && ts < yesterday.end;
  }), [txs, yesterday]);
  const yStats = useMemo(() => {
    if (period !== "daily") return null;
    let income = 0, expense = 0;
    const catExpense: Record<string, number> = {};
    for (const t of ydayTxs) {
      const amt = Number(t.amount || 0);
      if (INCOME.has(t.type)) income += amt;
      else if (EXPENSE.has(t.type)) {
        expense += amt;
        const c = t.category || t.type;
        catExpense[c] = (catExpense[c] || 0) + amt;
      }
    }
    const topExpenseCats = Object.entries(catExpense).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { income, expense, net: income - expense, topExpenseCats };
  }, [ydayTxs, period]);

  const stats = useMemo(() => {
    let income = 0, expense = 0;
    const catExpense: Record<string, number> = {};
    const catIncome: Record<string, number> = {};
    for (const t of filteredTxs) {
      const amt = Number(t.amount || 0);
      if (INCOME.has(t.type)) {
        income += amt;
        const c = t.category || t.type;
        catIncome[c] = (catIncome[c] || 0) + amt;
      } else if (EXPENSE.has(t.type)) {
        expense += amt;
        const c = t.category || t.type;
        catExpense[c] = (catExpense[c] || 0) + amt;
      }
    }
    let returned = 0;
    for (const s of filteredSales) {
      if (s.delivery_status === "returned") returned++;
    }
    const topExpenseCats = Object.entries(catExpense).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topIncomeCats = Object.entries(catIncome).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      income, expense, net: income - expense, returned,
      topExpenseCats, topIncomeCats,
    };
  }, [filteredTxs, filteredSales]);

  const periodLabel = period === "daily" ? (bn ? "আজ" : "Today")
    : period === "weekly" ? (bn ? "৭ দিন" : "7 Days")
    : (bn ? "এই মাস" : "This Month");

  // ---- Drilldown helpers ----
  const openCatDrill = (cat: string, kind: "income" | "expense", scope: "period" | "yesterday" = "period") => {
    const src = scope === "yesterday" ? ydayTxs : filteredTxs;
    const set = kind === "income" ? INCOME : EXPENSE;
    const rows = src
      .filter(t => set.has(t.type) && (t.category || t.type) === cat)
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
    const scopeLabel = scope === "yesterday" ? (bn ? "গতকাল" : "Yesterday") : periodLabel;
    setDrill({ title: `${categoryLabel(cat)} · ${scopeLabel}`, rows });
  };

  const openPeriodDrill = (scope: "period" | "yesterday" = "period", kind?: "income" | "expense") => {
    const src = scope === "yesterday" ? ydayTxs : filteredTxs;
    const rows = src
      .filter(t => (kind === "income" ? INCOME.has(t.type) : kind === "expense" ? EXPENSE.has(t.type) : (INCOME.has(t.type) || EXPENSE.has(t.type))))
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
    const scopeLabel = scope === "yesterday" ? (bn ? "গতকাল" : "Yesterday") : periodLabel;
    const kindLabel = kind === "income" ? (bn ? "আয়" : "Income") : kind === "expense" ? (bn ? "খরচ" : "Expense") : (bn ? "সব লেনদেন" : "All");
    setDrill({ title: `${kindLabel} · ${scopeLabel}`, rows });
  };

  const closeDrill = () => setDrill(null);

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center gap-1 rounded-full bg-muted p-1 w-fit mx-auto">
        {([
          ["daily", bn ? "দৈনিক" : "Daily", Calendar],
          ["weekly", bn ? "সাপ্তাহিক" : "Weekly", CalendarDays],
          ["monthly", bn ? "মাসিক" : "Monthly", CalendarRange],
        ] as const).map(([k, l, Ic]) => (
          <button key={k} onClick={() => setPeriod(k as Period)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full transition-all",
              period === k ? "bg-background shadow-sm font-medium" : "text-muted-foreground"
            )}>
            <Ic className="h-3.5 w-3.5" />{l}
          </button>
        ))}
      </div>

      {/* P&L hero — clickable */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-5">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <button className="w-full text-left" onClick={() => openPeriodDrill("period")}>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {bn ? "লাভ / লোকসান" : "Profit / Loss"} · {periodLabel}
            <ChevronRight className="h-3 w-3 opacity-60" />
          </p>
          <p className={cn("text-3xl sm:text-4xl font-semibold mt-1 tabular-nums",
            stats.net >= 0 ? "text-emerald-500" : "text-rose-500")}>
            {stats.net >= 0 ? "+" : ""}{fmt(stats.net, bn)}
          </p>
        </button>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button onClick={() => openPeriodDrill("period", "income")}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-left hover:bg-emerald-500/10 transition">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{bn ? "আয়" : "Income"}</p>
            <p className="text-lg font-semibold text-emerald-500 tabular-nums">{fmt(stats.income, bn)}</p>
          </button>
          <button onClick={() => openPeriodDrill("period", "expense")}
            className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-left hover:bg-rose-500/10 transition">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><ArrowDownRight className="h-3 w-3" />{bn ? "খরচ" : "Expense"}</p>
            <p className="text-lg font-semibold text-rose-500 tabular-nums">{fmt(stats.expense, bn)}</p>
          </button>
        </div>
      </Card>

      {/* Top expense categories */}
      <Card className="p-4 border-border/60">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="h-4 w-4 text-rose-500" />
          <h3 className="font-semibold text-sm">{bn ? "সবচেয়ে বেশি খরচের খাত" : "Top Expense Categories"}</h3>
        </div>
        {stats.topExpenseCats.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">{bn ? "কোনো খরচ নেই" : "No expenses in this period"}</p>
        ) : (
          <div className="space-y-2">
            {stats.topExpenseCats.map(([cat, amt], i) => {
              const max = stats.topExpenseCats[0][1] || 1;
              const pct = (amt / max) * 100;
              return (
                <button key={cat} onClick={() => openCatDrill(cat, "expense", "period")}
                  className="w-full text-left rounded-md p-1 -m-1 hover:bg-muted/60 transition">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5">#{bn ? (i + 1).toLocaleString("bn-BD") : i + 1}</Badge>
                      <span className="truncate capitalize">{categoryLabel(cat)}</span>
                    </span>
                    <b className="tabular-nums shrink-0 ml-2 text-rose-500 flex items-center gap-0.5">{fmt(amt, bn)}<ChevronRight className="h-3 w-3 opacity-60" /></b>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Top income sources */}
      {stats.topIncomeCats.length > 0 && (
        <Card className="p-4 border-border/60">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">{bn ? "সবচেয়ে বেশি আয়ের উৎস" : "Top Income Sources"}</h3>
          </div>
          <div className="space-y-2">
            {stats.topIncomeCats.map(([cat, amt], i) => {
              const max = stats.topIncomeCats[0][1] || 1;
              const pct = (amt / max) * 100;
              return (
                <button key={cat} onClick={() => openCatDrill(cat, "income", "period")}
                  className="w-full text-left rounded-md p-1 -m-1 hover:bg-muted/60 transition">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5">#{bn ? (i + 1).toLocaleString("bn-BD") : i + 1}</Badge>
                      <span className="truncate capitalize">{categoryLabel(cat)}</span>
                    </span>
                    <b className="tabular-nums shrink-0 ml-2 text-emerald-500 flex items-center gap-0.5">{fmt(amt, bn)}<ChevronRight className="h-3 w-3 opacity-60" /></b>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {yStats && (
        <Card className="p-4 border-border/60 bg-muted/30">
          <button className="w-full text-left" onClick={() => openPeriodDrill("yesterday")}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm flex items-center gap-1">{bn ? "গতকাল" : "Yesterday"}<ChevronRight className="h-3 w-3 opacity-60" /></h3>
              </div>
              <span className={cn("text-sm font-semibold tabular-nums",
                yStats.net >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {yStats.net >= 0 ? "+" : ""}{fmt(yStats.net, bn)}
              </span>
            </div>
          </button>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button onClick={() => openPeriodDrill("yesterday", "income")}
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-left hover:bg-emerald-500/10 transition">
              <p className="text-[10px] text-muted-foreground">{bn ? "আয়" : "Income"}</p>
              <p className="text-sm font-semibold text-emerald-500 tabular-nums">{fmt(yStats.income, bn)}</p>
            </button>
            <button onClick={() => openPeriodDrill("yesterday", "expense")}
              className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-2 text-left hover:bg-rose-500/10 transition">
              <p className="text-[10px] text-muted-foreground">{bn ? "খরচ" : "Expense"}</p>
              <p className="text-sm font-semibold text-rose-500 tabular-nums">{fmt(yStats.expense, bn)}</p>
            </button>
          </div>
          {yStats.topExpenseCats.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{bn ? "গতকালের খরচের খাত" : "Yesterday's expenses"}</p>
              {yStats.topExpenseCats.map(([cat, amt], i) => {
                const max = yStats.topExpenseCats[0][1] || 1;
                const pct = (amt / max) * 100;
                return (
                  <button key={cat} onClick={() => openCatDrill(cat, "expense", "yesterday")}
                    className="w-full text-left rounded-md p-1 -m-1 hover:bg-muted/60 transition">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5">#{bn ? (i + 1).toLocaleString("bn-BD") : i + 1}</Badge>
                        <span className="truncate capitalize">{categoryLabel(cat)}</span>
                      </span>
                      <b className="tabular-nums shrink-0 ml-2 text-rose-500 flex items-center gap-0.5">{fmt(amt, bn)}<ChevronRight className="h-3 w-3 opacity-60" /></b>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {stats.returned > 0 && (
        <Card className="p-3 border-rose-500/30 bg-rose-500/5 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-500" />
          <span>{bn ? `এই সময়ে ${stats.returned.toLocaleString("bn-BD")} টি অর্ডার রিটার্ন হয়েছে` : `${stats.returned} orders were returned in this period`}</span>
        </Card>
      )}

      {/* Drilldown Dialog */}
      <Dialog open={!!drill} onOpenChange={(v) => !v && closeDrill()}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm">{drill?.title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto -mx-6 px-6 space-y-2">
            {(!drill || drill.rows.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-8">{bn ? "কোনো লেনদেন নেই" : "No transactions"}</p>
            )}
            {drill?.rows.map(t => {
              const isIncome = INCOME.has(t.type);
              return (
                <div key={t.id} className="rounded-lg border border-border/60 bg-card p-3 flex items-start gap-2">
                  <div className={cn("shrink-0 mt-0.5 h-8 w-8 rounded-full grid place-items-center",
                    isIncome ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                    {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium truncate capitalize">{categoryLabel(t.category || t.type)}</p>
                      <b className={cn("tabular-nums text-sm shrink-0", isIncome ? "text-emerald-500" : "text-rose-500")}>
                        {isIncome ? "+" : "-"}{fmt(Number(t.amount || 0), bn)}
                      </b>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{fmtDateTime(t.occurred_at, bn)}</p>
                    {t.note && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.note}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {onEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => { onEdit(t); closeDrill(); }} title={bn ? "সম্পাদনা" : "Edit"}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" onClick={() => { onDelete(t.id); }} title={bn ? "মুছুন" : "Delete"}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
