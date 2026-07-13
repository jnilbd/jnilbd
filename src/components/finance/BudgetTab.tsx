import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Target, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BudgetRow { id: string; category: string; monthly_limit: number; }
interface Tx { type: string; amount: number; category: string | null; occurred_at: string; }

const EXPENSE_TYPES = new Set(["expense","purchase","loan_given","repayment_out","return_out","stock_out"]);

const fmt = (n: number, bn = false) => {
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(Math.abs(n));
  return `৳${s}`;
};

export const BudgetTab = ({
  userId, txs, bn, categories, categoryLabel,
}: {
  userId: string; txs: Tx[]; bn: boolean;
  categories: string[]; categoryLabel: (c: string) => string;
}) => {
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("");
  const [limit, setLimit] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("budgets").select("*").eq("user_id", userId).order("created_at");
    setBudgets((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  // spent this month per category
  const monthSpent = useMemo(() => {
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
    const map = new Map<string, number>();
    for (const t of txs) {
      if (!EXPENSE_TYPES.has(t.type)) continue;
      const d = new Date(t.occurred_at);
      if (d.getFullYear() !== y || d.getMonth() !== m) continue;
      const k = (t.category || "").toLowerCase();
      map.set(k, (map.get(k) || 0) + Number(t.amount || 0));
    }
    return map;
  }, [txs]);

  const save = async () => {
    if (!cat || !limit || Number(limit) <= 0) {
      toast.error(bn ? "ক্যাটাগরি ও লিমিট দিন" : "Enter category & limit"); return;
    }
    setBusy(true);
    const existing = budgets.find(b => b.category.toLowerCase() === cat.toLowerCase());
    const payload: any = { user_id: userId, category: cat, monthly_limit: Math.round(Number(limit)) };
    const { error } = existing
      ? await supabase.from("budgets").update({ monthly_limit: payload.monthly_limit }).eq("id", existing.id)
      : await supabase.from("budgets").insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "সংরক্ষিত" : "Saved");
    setOpen(false); setCat(""); setLimit("");
    await load();
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "মুছে ফেলা হয়েছে" : "Deleted");
    await load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{bn ? "মাসিক বাজেট" : "Monthly Budgets"}</p>
          <p className="text-[11px] text-muted-foreground">
            {new Date().toLocaleDateString(bn?"bn-BD":"en-BD", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="rounded-xl">
          <Plus className="h-4 w-4 mr-1" /> {bn?"যোগ":"Add"}
        </Button>
      </div>

      {loading ? (
        <div className="py-10 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : budgets.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {bn ? "কোনো বাজেট সেট করা নেই" : "No budgets yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {budgets.map(b => {
            const spent = monthSpent.get(b.category.toLowerCase()) || 0;
            const pct = b.monthly_limit > 0 ? Math.min(100, (spent / b.monthly_limit) * 100) : 0;
            const over = spent > b.monthly_limit;
            const left = b.monthly_limit - spent;
            return (
              <Card key={b.id} className="p-3 border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("h-8 w-8 rounded-xl grid place-items-center",
                    over ? "bg-rose-500/10 text-rose-500" : pct > 80 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{categoryLabel(b.category)}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {fmt(spent, bn)} / {fmt(b.monthly_limit, bn)}
                    </p>
                  </div>
                  <div className={cn("text-xs font-semibold tabular-nums", over ? "text-rose-500" : "text-muted-foreground")}>
                    {over ? `+${fmt(spent - b.monthly_limit, bn)}` : `${fmt(left, bn)} ${bn?"বাকি":"left"}`}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-500" onClick={() => del(b.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full transition-all",
                      over ? "bg-rose-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{bn ? "বাজেট যোগ / আপডেট" : "Add / Update Budget"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">{bn?"ক্যাটাগরি":"Category"}</Label>
              <div className="flex flex-wrap gap-1.5 mt-1 max-h-40 overflow-y-auto">
                {categories.map(c => (
                  <button key={c} type="button" onClick={() => setCat(c)}
                    className={cn(
                      "text-[11px] px-3 py-1.5 rounded-full border transition-all",
                      cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-card/50 hover:bg-muted"
                    )}>
                    {categoryLabel(c)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">{bn?"মাসিক লিমিট (৳)":"Monthly Limit (৳)"}</Label>
              <Input type="number" inputMode="decimal" value={limit} onChange={e => setLimit(e.target.value)}
                className="text-xl font-semibold h-12 rounded-xl mt-1" placeholder="0" autoFocus />
            </div>
            <Button className="w-full h-12 rounded-xl" onClick={save} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (bn?"সংরক্ষণ":"Save")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
