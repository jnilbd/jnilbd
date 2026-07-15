import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowDownRight, ArrowUpRight, Trash2, Check, Loader2, HandCoins, History, Wallet } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DebtRow {
  id: string; direction: string; counterparty: string;
  amount: number; paid_amount: number | null; due_date: string | null;
  note: string | null; is_settled: boolean; created_at?: string;
  wallet_id?: string | null;
}
interface PaymentRow {
  id: string; debt_id: string; amount: number; paid_at: string; note: string | null;
  wallet_id?: string | null;
}
interface WalletRow {
  id: string; name: string; scope: string; balance: number;
}

const fmt = (n: number, bn = false) => {
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(Math.abs(n));
  return `৳${s}`;
};
const fmtDate = (iso: string, bn: boolean) =>
  new Date(iso).toLocaleDateString(bn ? "bn-BD" : "en-BD", { day: "numeric", month: "short", year: "numeric" });

export const DebtsTab = ({ userId, bn }: { userId: string; bn: boolean }) => {
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [dir, setDir] = useState<"owed_to_me" | "i_owe">("owed_to_me");
  const [party, setParty] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [walletId, setWalletId] = useState<string>("");

  // history / payment sheet
  const [historyFor, setHistoryFor] = useState<DebtRow | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState("");
  const [payWalletId, setPayWalletId] = useState<string>("");
  const [payBusy, setPayBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: dRows }, { data: wRows }] = await Promise.all([
      supabase.from("debts").select("*").eq("user_id", userId).order("is_settled").order("created_at", { ascending: false }),
      supabase.from("finance_wallets").select("id,name,scope,balance").eq("user_id", userId).order("name"),
    ]);
    setDebts((dRows as any) ?? []);
    setWallets((wRows as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const loadPayments = async (debtId: string) => {
    const { data } = await supabase.from("debt_payments").select("*").eq("debt_id", debtId).order("paid_at", { ascending: false });
    setPayments((data as any) ?? []);
  };

  const openHistory = async (d: DebtRow) => {
    setHistoryFor(d);
    setPayAmount("");
    setPayNote("");
    setPayDate(new Date().toISOString().slice(0, 10));
    await loadPayments(d.id);
  };

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
    if (!confirm(bn ? "মুছে ফেলবেন? পুরো ইতিহাস চলে যাবে।" : "Delete? All history will be lost.")) return;
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await load();
  };

  const addPayment = async (fullPayoff = false) => {
    if (!historyFor) return;
    const remaining = historyFor.amount - (historyFor.paid_amount || 0);
    const amt = fullPayoff ? remaining : Math.round(Number(payAmount));
    if (!amt || amt <= 0) { toast.error(bn ? "টাকা দিন" : "Enter amount"); return; }
    if (amt > remaining + 0.01) { toast.error(bn ? "বাকির চেয়ে বেশি" : "More than remaining"); return; }
    setPayBusy(true);
    const paidAtIso = new Date(`${payDate}T${new Date().toTimeString().slice(0, 8)}`).toISOString();
    const { error } = await supabase.from("debt_payments").insert({
      user_id: userId, debt_id: historyFor.id, amount: amt,
      paid_at: paidAtIso, note: payNote || null,
    });
    setPayBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "পরিশোধ যোগ হয়েছে" : "Payment recorded");
    setPayAmount(""); setPayNote("");
    await Promise.all([loadPayments(historyFor.id), load()]);
    // refresh historyFor snapshot
    const { data: refreshed } = await supabase.from("debts").select("*").eq("id", historyFor.id).maybeSingle();
    if (refreshed) setHistoryFor(refreshed as any);
  };

  const deletePayment = async (id: string) => {
    if (!historyFor) return;
    const { error } = await supabase.from("debt_payments").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await Promise.all([loadPayments(historyFor.id), load()]);
    const { data: refreshed } = await supabase.from("debts").select("*").eq("id", historyFor.id).maybeSingle();
    if (refreshed) setHistoryFor(refreshed as any);
  };

  const owedToMe = debts.filter(d => d.direction === "owed_to_me" && !d.is_settled);
  const iOwe = debts.filter(d => d.direction === "i_owe" && !d.is_settled);
  const settled = debts.filter(d => d.is_settled);

  const totalOwedToMe = owedToMe.reduce((s, d) => s + (d.amount - (d.paid_amount || 0)), 0);
  const totalIOwe = iOwe.reduce((s, d) => s + (d.amount - (d.paid_amount || 0)), 0);

  const DebtCard = ({ d }: { d: DebtRow }) => {
    const isReceivable = d.direction === "owed_to_me";
    const paid = d.paid_amount || 0;
    const remaining = d.amount - paid;
    const pct = d.amount > 0 ? Math.min(100, Math.round((paid / d.amount) * 100)) : 0;
    return (
      <Card
        className={cn("p-3 border-border/60 space-y-2 cursor-pointer hover:border-primary/40 transition-colors", d.is_settled && "opacity-70")}
        onClick={() => openHistory(d)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("h-9 w-9 rounded-xl grid place-items-center shrink-0",
            isReceivable ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {isReceivable ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{d.counterparty}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {d.created_at ? fmtDate(d.created_at, bn) : ""}
              {d.due_date ? ` → ${fmtDate(d.due_date, bn)}` : ""}
              {d.note ? ` · ${d.note}` : ""}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className={cn("text-sm font-semibold tabular-nums",
              d.is_settled ? "text-muted-foreground line-through" : (isReceivable ? "text-emerald-500" : "text-rose-500"))}>
              {fmt(remaining, bn)}
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {bn ? "মোট" : "of"} {fmt(d.amount, bn)}
            </div>
          </div>
        </div>
        {/* progress */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full transition-all", isReceivable ? "bg-emerald-500" : "bg-rose-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{bn ? "পরিশোধিত" : "Paid"} {fmt(paid, bn)} ({pct}%)</span>
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><History className="h-3 w-3" /> {bn ? "ইতিহাস" : "History"}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); del(d.id); }}
              className="hover:text-rose-500"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        </div>
      </Card>
    );
  };

  const historyRemaining = historyFor ? historyFor.amount - (historyFor.paid_amount || 0) : 0;

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

      {/* Add debt sheet */}
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
              <Label className="text-xs">{bn?"কারণ / উদ্দেশ্য":"Purpose / Reason"}</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} className="mt-1 rounded-xl"
                placeholder={bn?"কেন ধার? কী কাজে? (যেমন: চিকিৎসা, ব্যবসা)":"Why? What for? (e.g. medical, business)"} />

            </div>
            <Button className="w-full h-12 rounded-xl" onClick={save} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (bn?"সংরক্ষণ":"Save")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* History + payment sheet */}
      <Sheet open={!!historyFor} onOpenChange={(v) => !v && setHistoryFor(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          {historyFor && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {historyFor.direction === "owed_to_me"
                    ? <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                    : <ArrowUpRight className="h-4 w-4 text-rose-500" />}
                  {historyFor.counterparty}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-3">
                {/* Summary */}
                <Card className="p-3 border-border/60">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{bn?"মূল":"Original"}</p>
                      <p className="text-sm font-semibold tabular-nums">{fmt(historyFor.amount, bn)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{bn?"পরিশোধিত":"Paid"}</p>
                      <p className="text-sm font-semibold text-emerald-500 tabular-nums">{fmt(historyFor.paid_amount || 0, bn)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{bn?"বাকি":"Remaining"}</p>
                      <p className={cn("text-sm font-semibold tabular-nums", historyFor.is_settled ? "text-muted-foreground" : "text-rose-500")}>
                        {fmt(historyRemaining, bn)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 text-center">
                    {bn ? "নেওয়া হয়েছিল" : "Taken on"}: {historyFor.created_at ? fmtDate(historyFor.created_at, bn) : "-"}
                    {historyFor.due_date && <> · {bn ? "শেষ তারিখ" : "Due"}: {fmtDate(historyFor.due_date, bn)}</>}
                  </p>
                </Card>

                {/* Add payment */}
                {!historyFor.is_settled && (
                  <Card className="p-3 border-border/60 space-y-2">
                    <p className="text-xs font-semibold">{bn?"নতুন পরিশোধ":"Add Payment"}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px]">{bn?"টাকা":"Amount"}</Label>
                        <Input type="number" inputMode="decimal" value={payAmount}
                          onChange={e => setPayAmount(e.target.value)}
                          className="mt-1 rounded-xl h-10" placeholder={`${bn?"বাকি":"Remaining"}: ${fmt(historyRemaining, bn)}`} />
                      </div>
                      <div>
                        <Label className="text-[10px]">{bn?"তারিখ":"Date"}</Label>
                        <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                          className="mt-1 rounded-xl h-10" />
                      </div>
                    </div>
                    <Input value={payNote} onChange={e => setPayNote(e.target.value)}
                      className="rounded-xl h-9 text-sm" placeholder={bn?"নোট (ঐচ্ছিক)":"Note (optional)"} />
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="rounded-xl" onClick={() => addPayment(false)} disabled={payBusy}>
                        {payBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : (bn?"পরিশোধ যোগ":"Add")}
                      </Button>
                      <Button className="rounded-xl" onClick={() => addPayment(true)} disabled={payBusy || historyRemaining <= 0}>
                        <Check className="h-4 w-4 mr-1" /> {bn?"সম্পূর্ণ পরিশোধ":"Pay Full"}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Payment history */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground px-1 mb-2 flex items-center gap-1">
                    <History className="h-3 w-3" /> {bn?"পরিশোধের ইতিহাস":"Payment History"} ({payments.length})
                  </p>
                  {payments.length === 0 ? (
                    <Card className="p-6 text-center border-dashed">
                      <Wallet className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{bn?"এখনো কোনো পরিশোধ নেই":"No payments yet"}</p>
                    </Card>
                  ) : (
                    <div className="space-y-1.5">
                      {payments.map(p => (
                        <Card key={p.id} className="p-2.5 border-border/60 flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 grid place-items-center shrink-0">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium tabular-nums text-emerald-500">{fmt(p.amount, bn)}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {fmtDate(p.paid_at, bn)}{p.note ? ` · ${p.note}` : ""}
                            </p>
                          </div>
                          <button onClick={() => deletePayment(p.id)} className="text-muted-foreground hover:text-rose-500 p-1">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
