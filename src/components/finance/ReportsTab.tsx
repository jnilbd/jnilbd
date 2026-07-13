import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, PiggyBank, Package, Trophy, AlertTriangle,
  Calendar, CalendarDays, CalendarRange, Loader2, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "monthly";

interface TxRow {
  type: string;
  amount: number;
  category: string | null;
  scope: string;
  occurred_at: string;
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

const startOf = (p: Period) => {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (p === "weekly") d.setDate(d.getDate() - 6);
  else if (p === "monthly") d.setDate(1);
  return d.getTime();
};

export function ReportsTab({
  userId, bn, txs, categoryLabel,
}: {
  userId: string;
  bn: boolean;
  txs: TxRow[];
  categoryLabel: (c: string) => string;
}) {
  const [period, setPeriod] = useState<Period>("daily");
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("finance_sales")
        .select("product_name,quantity,unit_price,cost_price,discount,total_amount,occurred_at,delivery_status")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false });
      setSales((data as SaleRow[]) || []);
      setLoading(false);
    })();
  }, [userId]);

  const from = useMemo(() => startOf(period), [period]);

  const filteredTxs = useMemo(() => txs.filter(t => new Date(t.occurred_at).getTime() >= from), [txs, from]);
  const filteredSales = useMemo(() => sales.filter(s => new Date(s.occurred_at).getTime() >= from), [sales, from]);

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
    let salesTotal = 0, salesProfit = 0, salesQty = 0, delivered = 0, returned = 0;
    const productMap: Record<string, { qty: number; revenue: number; profit: number }> = {};
    for (const s of filteredSales) {
      const rev = Number(s.total_amount || 0);
      const profit = (Number(s.unit_price) - Number(s.cost_price)) * Number(s.quantity) - Number(s.discount || 0);
      salesTotal += rev;
      salesProfit += profit;
      salesQty += Number(s.quantity || 0);
      if (s.delivery_status === "delivered") delivered++;
      if (s.delivery_status === "returned") returned++;
      const key = s.product_name || "—";
      productMap[key] = productMap[key] || { qty: 0, revenue: 0, profit: 0 };
      productMap[key].qty += Number(s.quantity || 0);
      productMap[key].revenue += rev;
      productMap[key].profit += profit;
    }
    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
    const topExpenseCats = Object.entries(catExpense).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topIncomeCats = Object.entries(catIncome).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      income, expense, net: income - expense,
      salesTotal, salesProfit, salesQty, delivered, returned,
      topProducts, topExpenseCats, topIncomeCats,
    };
  }, [filteredTxs, filteredSales]);

  const periodLabel = period === "daily" ? (bn ? "আজ" : "Today")
    : period === "weekly" ? (bn ? "৭ দিন" : "7 Days")
    : (bn ? "এই মাস" : "This Month");

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

      {/* P&L hero */}
      <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/10 via-background to-background p-5">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <p className="text-xs text-muted-foreground">{bn ? "লাভ / লোকসান" : "Profit / Loss"} · {periodLabel}</p>
        <p className={cn("text-3xl sm:text-4xl font-semibold mt-1 tabular-nums",
          stats.net >= 0 ? "text-emerald-500" : "text-rose-500")}>
          {stats.net >= 0 ? "+" : ""}{fmt(stats.net, bn)}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{bn ? "আয়" : "Income"}</p>
            <p className="text-lg font-semibold text-emerald-500 tabular-nums">{fmt(stats.income, bn)}</p>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><ArrowDownRight className="h-3 w-3" />{bn ? "খরচ" : "Expense"}</p>
            <p className="text-lg font-semibold text-rose-500 tabular-nums">{fmt(stats.expense, bn)}</p>
          </div>
        </div>
      </Card>

      {/* Sales summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricBox label={bn ? "বিক্রয়" : "Sales"} value={fmt(stats.salesTotal, bn)} icon={TrendingUp} tone="emerald" />
        <MetricBox label={bn ? "লাভ" : "Profit"} value={fmt(stats.salesProfit, bn)} icon={PiggyBank} tone={stats.salesProfit >= 0 ? "emerald" : "rose"} />
        <MetricBox label={bn ? "পণ্য বিক্রি" : "Items Sold"} value={bn ? stats.salesQty.toLocaleString("bn-BD") : stats.salesQty} icon={Package} />
        <MetricBox label={bn ? "ডেলিভার্ড" : "Delivered"} value={bn ? stats.delivered.toLocaleString("bn-BD") : stats.delivered} icon={Trophy} />
      </div>

      {/* Top selling products */}
      <Card className="p-4 border-border/60">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-sm">{bn ? "সবচেয়ে বেশি বিক্রি হওয়া পণ্য" : "Top Selling Products"}</h3>
        </div>
        {loading ? (
          <div className="py-4 text-center"><Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" /></div>
        ) : stats.topProducts.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">{bn ? "কোনো বিক্রয় নেই" : "No sales in this period"}</p>
        ) : (
          <div className="space-y-2">
            {stats.topProducts.map(([name, d], i) => {
              const max = stats.topProducts[0][1].revenue || 1;
              const pct = (d.revenue / max) * 100;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5">#{bn ? (i + 1).toLocaleString("bn-BD") : i + 1}</Badge>
                      <span className="truncate">{name}</span>
                    </span>
                    <span className="tabular-nums shrink-0 ml-2">
                      <b>{fmt(d.revenue, bn)}</b>
                      <span className="text-muted-foreground"> · {bn ? d.qty.toLocaleString("bn-BD") : d.qty}{bn ? " টি" : ""}</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5">#{bn ? (i + 1).toLocaleString("bn-BD") : i + 1}</Badge>
                      <span className="truncate capitalize">{categoryLabel(cat)}</span>
                    </span>
                    <b className="tabular-nums shrink-0 ml-2 text-rose-500">{fmt(amt, bn)}</b>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
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
                <div key={cat}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5">#{bn ? (i + 1).toLocaleString("bn-BD") : i + 1}</Badge>
                      <span className="truncate capitalize">{categoryLabel(cat)}</span>
                    </span>
                    <b className="tabular-nums shrink-0 ml-2 text-emerald-500">{fmt(amt, bn)}</b>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {stats.returned > 0 && (
        <Card className="p-3 border-rose-500/30 bg-rose-500/5 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-500" />
          <span>{bn ? `এই সময়ে ${stats.returned.toLocaleString("bn-BD")} টি অর্ডার রিটার্ন হয়েছে` : `${stats.returned} orders were returned in this period`}</span>
        </Card>
      )}
    </div>
  );
}

function MetricBox({ label, value, icon: Icon, tone }: { label: string; value: any; icon: any; tone?: "emerald" | "rose" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Icon className="h-3 w-3" />{label}
      </div>
      <p className={cn("text-base font-semibold tabular-nums mt-0.5",
        tone === "emerald" && "text-emerald-500",
        tone === "rose" && "text-rose-500")}>{value}</p>
    </div>
  );
}
