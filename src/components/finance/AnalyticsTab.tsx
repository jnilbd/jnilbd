import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Pencil, Trash2 } from "lucide-react";


interface Tx {
  id: string; type: string; amount: number; category: string | null; occurred_at: string;
}

const EXPENSE_TYPES = new Set(["expense","purchase","loan_given","repayment_out","return_out","stock_out"]);
const INCOME_TYPES = new Set(["income","sale","loan_taken","repayment_in","return_in","stock_in"]);

const PALETTE = [
  "hsl(var(--primary))", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1",
];

const fmt = (n: number, bn = false) => {
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(Math.abs(n));
  return `৳${s}`;
};

export const AnalyticsTab = ({
  txs, bn, categoryLabel, onEdit, onDelete,
}: { txs: Tx[]; bn: boolean; categoryLabel: (c: string) => string; onEdit?: (t: Tx) => void; onDelete?: (id: string) => void }) => {
  const [monthOffset, setMonthOffset] = useState(0); // 0 = this month
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [drill, setDrill] = useState<{ title: string; items: Tx[] } | null>(null);


  const monthDate = useMemo(() => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthLabel = monthDate.toLocaleString(bn ? "bn-BD" : "en-BD", { month: "long", year: "numeric" });

  const monthTxs = useMemo(() => {
    const y = monthDate.getFullYear(), m = monthDate.getMonth();
    return txs.filter(t => {
      const d = new Date(t.occurred_at);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [txs, monthDate]);

  const spendingByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthTxs) {
      if (!EXPENSE_TYPES.has(t.type)) continue;
      const key = t.category || (bn ? "অন্যান্য" : "Other");
      map.set(key, (map.get(key) || 0) + Number(t.amount || 0));
    }
    const arr = Array.from(map, ([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr;
  }, [monthTxs, bn]);

  const totalExpense = spendingByCategory.reduce((s, x) => s + x.value, 0);
  const totalIncome = useMemo(
    () => monthTxs.filter(t => INCOME_TYPES.has(t.type)).reduce((s, t) => s + Number(t.amount || 0), 0),
    [monthTxs]
  );

  // Calendar heatmap
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const firstDow = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
  const dayTotals = useMemo(() => {
    const map = new Map<number, { inc: number; exp: number }>();
    for (const t of monthTxs) {
      const d = new Date(t.occurred_at).getDate();
      const cur = map.get(d) || { inc: 0, exp: 0 };
      const amt = Number(t.amount || 0);
      if (INCOME_TYPES.has(t.type)) cur.inc += amt;
      else if (EXPENSE_TYPES.has(t.type)) cur.exp += amt;
      map.set(d, cur);
    }
    return map;
  }, [monthTxs]);

  const maxExp = Math.max(1, ...Array.from(dayTotals.values()).map(v => v.exp));

  const selectedDayTxs = useMemo(() => {
    if (!selectedDay) return [];
    return monthTxs.filter(t => {
      const d = new Date(t.occurred_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === selectedDay;
    });
  }, [monthTxs, selectedDay]);

  const dowLabels = bn ? ["রবি","সোম","মঙ্গল","বুধ","বৃহঃ","শুক্র","শনি"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div className="space-y-4">
      {/* Month picker */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 backdrop-blur px-3 py-2">
        <button onClick={() => { setMonthOffset(o => o - 1); setSelectedDay(null); }} className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold capitalize">{monthLabel}</p>
          <p className="text-[10px] text-muted-foreground">
            {bn?"আয়":"Income"} {fmt(totalIncome, bn)} · {bn?"খরচ":"Expense"} {fmt(totalExpense, bn)}
          </p>
        </div>
        <button
          onClick={() => { setMonthOffset(o => Math.min(0, o + 1)); setSelectedDay(null); }}
          disabled={monthOffset >= 0}
          className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Pie chart */}
      <Card className="p-4 border-border/60">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">{bn ? "খরচ বিশ্লেষণ" : "Spending Analysis"}</p>
          <span className="text-[11px] text-muted-foreground">{spendingByCategory.length} {bn?"ক্যাটাগরি":"categories"}</span>
        </div>
        {spendingByCategory.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            {bn ? "এই মাসে কোনো খরচ নেই" : "No expenses this month"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {spendingByCategory.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => fmt(v, bn)}
                    labelFormatter={(l: string) => categoryLabel(l)}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {spendingByCategory.map((c, i) => {
                const pct = totalExpense > 0 ? (c.value / totalExpense) * 100 : 0;
                return (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="h-3 w-3 rounded shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="flex-1 truncate">{categoryLabel(c.name)}</span>
                    <span className="tabular-nums text-muted-foreground">{pct.toFixed(0)}%</span>
                    <span className="tabular-nums font-medium w-16 text-right">{fmt(c.value, bn)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Calendar heatmap */}
      <Card className="p-4 border-border/60">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">{bn ? "মাসিক ক্যালেন্ডার" : "Monthly Calendar"}</p>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {dowLabels.map(d => (
            <div key={d} className="text-[10px] text-muted-foreground py-1">{d}</div>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const t = dayTotals.get(day);
            const exp = t?.exp || 0;
            const intensity = exp > 0 ? Math.max(0.15, Math.min(1, exp / maxExp)) : 0;
            const dayKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}-${day}`;
            const isSelected = selectedDay === dayKey;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : dayKey)}
                className={cn(
                  "aspect-square rounded-lg text-[11px] font-medium transition-all border",
                  isSelected ? "border-primary ring-2 ring-primary/40" : "border-transparent",
                  exp === 0 ? "bg-muted/40 text-muted-foreground hover:bg-muted" : "text-foreground hover:scale-105"
                )}
                style={exp > 0 ? { background: `rgba(244, 63, 94, ${intensity * 0.85})` } : undefined}
                title={t ? `${bn?"খরচ":"Expense"}: ${fmt(exp, bn)}` : ""}
              >
                {bn ? new Intl.NumberFormat("bn-BD").format(day) : day}
              </button>
            );
          })}
        </div>
        {selectedDay && (
          <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
            <p className="text-xs font-semibold">
              {new Date(...(selectedDay.split("-").map(Number) as [number, number, number]))
                .toLocaleDateString(bn?"bn-BD":"en-BD", { dateStyle: "full" })}
            </p>
            {selectedDayTxs.length === 0 ? (
              <p className="text-xs text-muted-foreground">{bn?"কোনো লেনদেন নেই":"No transactions"}</p>
            ) : (
              selectedDayTxs.map(t => {
                const inc = INCOME_TYPES.has(t.type);
                return (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1">
                    <span className="truncate">{categoryLabel(t.category || t.type)}</span>
                    <span className={cn("tabular-nums font-medium", inc ? "text-emerald-500" : "text-rose-500")}>
                      {inc ? "+" : "-"}{fmt(Number(t.amount), bn)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
