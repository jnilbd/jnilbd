import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, ArrowDownRight, ArrowUpRight, Trash2, Check, Loader2, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DebtRow {
  id: string; direction: string; counterparty: string;
  amount: number; paid_amount: number | null; due_date: string | null;
  note: string | null; is_settled: boolean;
}

const fmt = (n: number, bn = false) => {
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(Math.abs(n));
  return `৳${s}`;
};

export const DebtsTab = ({ userId, bn }: { userId: string; bn: boolean }) => {
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [dir, setDir] = useState<"owed_to_me" | "i_owe">("owed_to_me");
  const [party, setParty] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("debts").select("*").eq("user_id", userId).order("is_settled").order("created_at", { ascending: false });
    setDebts((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const save = async () => {
    if (!party.trim() || !amount || Number(amount) <= 0) {
      toast.error(bn ? "নাম ও টাকা দিন" : "Enter name & amount"); return;
    }
    setBusy(true);
    const { error } = await supabase.from("debts").insert({
      user_id: userId, direction: dir, counterparty: party.trim(),
      amount: Math.round(Number(amount)),
      due_date: dueDate || null, note: note || null, paid_amount: 0, is_settled: false,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "যোগ হয়েছে" : "Added");
    setOpen(false); setParty(""); setAmount(""); setDueDate(""); setNote("");
    await load();
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await load();
  };

  const settle = async (d: DebtRow) => {
    const { error } = await supabase.from("debts").update({ is_settled: !d.is_settled, paid_amount: d.is_settled ? d.paid_amount : d.amount }).eq("id", d.id);
    if (error) { toast.error(error.message); return; }
    await load();
  };

  const owedToMe = debts.filter(d => d.direction === "owed_to_me" && !d.is_settled);
  const iOwe = debts.filter(d => d.direction === "i_owe" && !d.is_settled);
  const settled = debts.filter(d => d.is_settled);

  const totalOwedToMe = owedToMe.reduce((s, d) => s + (d.amount - (d.paid_amount || 0)), 0);
  const totalIOwe = iOwe.reduce((s, d) => s + (d.amount - (d.paid_amount || 0)), 0);

  const DebtCard = ({ d }: { d: DebtRow }) => {
    const isReceivable = d.direction === "owed_to_me";
    const remaining = d.amount - (d.paid_amount || 0);
    return (
      <Card className={cn("p-3 border-border/60 flex items-center gap-3", d.is_settled && "opacity-60")}>
        <div className={cn("h-9 w-9 rounded-xl grid place-items-center shrink-0",
          isReceivable ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {isReceivable ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{d.counterparty}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {d.due_date ? new Date(d.due_date).toLocaleDateString(bn?"bn-BD":"en-BD", { dateStyle: "medium" }) : (bn?"তারিখ নেই":"No due date")}
            {d.note ? ` · ${d.note}` : ""}
          </p>
        </div>
        <div className={cn("text-sm font-semibold tabular-nums shrink-0",
          isReceivable ? "text-emerald-500" : "text-rose-500")}>
          {fmt(remaining, bn)}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-500" onClick={() => settle(d)}>
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-500" onClick={() => del(d.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3 border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[10px] text-muted-foreground">{bn?"পাওনা (আমার)":"Owed To Me"}</p>
          <p className="text-lg font-semibold text-emerald-500 tabular-nums">{fmt(totalOwedToMe, bn)}</p>
          <p className="text-[10px] text-muted-foreground">{owedToMe.length} {bn?"জন":"people"}</p>
        </Card>
        <Card className="p-3 border-rose-500/20 bg-rose-500/5">
          <p className="text-[10px] text-muted-foreground">{bn?"দেনা (আমার)":"I Owe"}</p>
          <p className="text-lg font-semibold text-rose-500 tabular-nums">{fmt(totalIOwe, bn)}</p>
          <p className="text-[10px] text-muted-foreground">{iOwe.length} {bn?"জন":"people"}</p>
        </Card>
      </div>

      <Button className="w-full rounded-xl" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" /> {bn?"নতুন দেনা/পাওনা":"New Debt"}
      </Button>

      {loading ? (
        <div className="py-10 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {owedToMe.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground px-1">{bn?"পাওনা (আমি পাব)":"Receivables"}</p>
              {owedToMe.map(d => <DebtCard key={d.id} d={d} />)}
            </div>
          )}
          {iOwe.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground px-1">{bn?"দেনা (আমি দেব)":"Payables"}</p>
              {iOwe.map(d => <DebtCard key={d.id} d={d} />)}
            </div>
          )}
          {settled.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground px-1">{bn?"পরিশোধিত":"Settled"}</p>
              {settled.slice(0, 10).map(d => <DebtCard key={d.id} d={d} />)}
            </div>
          )}
          {debts.length === 0 && (
            <Card className="p-8 text-center border-dashed">
              <HandCoins className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{bn?"কোনো দেনা-পাওনা নেই":"No debts recorded"}</p>
            </Card>
          )}
        </>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{bn?"দেনা / পাওনা যোগ":"Add Debt"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setDir("owed_to_me")}
                className={cn("p-3 rounded-xl border text-sm transition-all",
                  dir === "owed_to_me" ? "border-emerald-500 bg-emerald-500/10" : "border-border/60"
                )}>
                <ArrowDownRight className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                {bn?"আমি পাব":"Owed to me"}
              </button>
              <button type="button" onClick={() => setDir("i_owe")}
                className={cn("p-3 rounded-xl border text-sm transition-all",
                  dir === "i_owe" ? "border-rose-500 bg-rose-500/10" : "border-border/60"
                )}>
                <ArrowUpRight className="h-4 w-4 mx-auto mb-1 text-rose-500" />
                {bn?"আমি দেব":"I owe"}
              </button>
            </div>
            <div>
              <Label className="text-xs">{bn?"নাম":"Party name"}</Label>
              <Input value={party} onChange={e => setParty(e.target.value)} className="mt-1 rounded-xl" autoFocus />
            </div>
            <div>
              <Label className="text-xs">{bn?"টাকা":"Amount (৳)"}</Label>
              <Input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
                className="text-xl font-semibold h-12 rounded-xl mt-1" placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">{bn?"তারিখ (ঐচ্ছিক)":"Due date (optional)"}</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">{bn?"নোট":"Note"}</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} className="mt-1 rounded-xl" placeholder={bn?"ঐচ্ছিক":"Optional"} />
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
