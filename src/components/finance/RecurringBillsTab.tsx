import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Plus, Pencil, Trash2, CheckCircle2, Circle, Repeat, Loader2, Home, Wifi, Smartphone, Zap, Receipt, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string | null;
  wallet_id: string | null;
  scope: "personal" | "business";
  due_day: number;
  is_active: boolean;
  note: string | null;
  last_paid_at: string | null;
}

interface Props {
  userId: string;
  bn: boolean;
  wallets: Array<{ id: string; name: string; scope: string; balance: number }>;
  onPaid?: () => void;
}

const DEFAULT_CATEGORIES = [
  "বাড়ি ভাড়া", "WiFi Bill (Village)", "WiFi Bill (City)", "Dish Bill",
  "Mobile Bill", "Electricity Bill", "Gas Bill", "Water Bill",
  "Installment", "bKash Loan", "Internet", "Rent", "Bills", "Other",
];

const iconFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("rent") || n.includes("বাড়ি") || n.includes("ভাড়া")) return Home;
  if (n.includes("wifi") || n.includes("internet") || n.includes("dish")) return Wifi;
  if (n.includes("mobile") || n.includes("phone") || n.includes("recharge")) return Smartphone;
  if (n.includes("electric") || n.includes("gas") || n.includes("বিদ্যুৎ")) return Zap;
  if (n.includes("loan") || n.includes("কিস্তি") || n.includes("installment")) return CreditCard;
  return Receipt;
};

const monthKey = (d: Date | string) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth()}`;
};
const currentMonthKey = () => monthKey(new Date());

const fmtBDT = (n: number, bn = false) => {
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(Math.abs(n));
  return `৳${s}`;
};

export function RecurringBillsTab({ userId, bn, wallets, onPaid }: Props) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("বাড়ি ভাড়া");
  const [walletId, setWalletId] = useState<string>("");
  const [scope, setScope] = useState<"personal" | "business">("personal");
  const [dueDay, setDueDay] = useState<string>("1");
  const [isActive, setIsActive] = useState(true);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("finance_recurring_bills")
      .select("*")
      .eq("user_id", userId)
      .order("due_day", { ascending: true });
    if (error) toast.error(error.message);
    setBills((data as any) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setEditing(null);
    setName(""); setAmount(""); setCategory("বাড়ি ভাড়া");
    setWalletId(""); setScope("personal"); setDueDay("1");
    setIsActive(true); setNote("");
  };

  const openAdd = () => { reset(); setOpen(true); };
  const openEdit = (b: Bill) => {
    setEditing(b);
    setName(b.name); setAmount(String(b.amount));
    setCategory(b.category || "Other");
    setWalletId(b.wallet_id || "");
    setScope(b.scope); setDueDay(String(b.due_day));
    setIsActive(b.is_active); setNote(b.note || "");
    setOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return toast.error(bn ? "নাম দিন" : "Name required");
    const amt = Number(amount);
    if (!(amt > 0)) return toast.error(bn ? "সঠিক টাকা দিন" : "Enter valid amount");
    const dd = Math.max(1, Math.min(31, Number(dueDay) || 1));
    setBusy(true);
    const payload: any = {
      user_id: userId, name: name.trim(), amount: amt, category,
      wallet_id: walletId || null, scope, due_day: dd,
      is_active: isActive, note: note || null,
    };
    let error;
    if (editing) {
      ({ error } = await (supabase as any).from("finance_recurring_bills").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await (supabase as any).from("finance_recurring_bills").insert(payload));
    }
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(bn ? "সংরক্ষিত হয়েছে" : "Saved");
    setOpen(false); reset(); load();
  };

  const remove = async (b: Bill) => {
    if (!confirm(bn ? `"${b.name}" মুছে ফেলবেন?` : `Delete "${b.name}"?`)) return;
    const { error } = await (supabase as any).from("finance_recurring_bills").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success(bn ? "মুছে ফেলা হয়েছে" : "Deleted");
    load();
  };

  const payNow = async (b: Bill) => {
    if (!b.wallet_id) return toast.error(bn ? "প্রথমে ওয়ালেট নির্বাচন করুন (এডিট)" : "Select a wallet first (edit)");
    if (!confirm(bn ? `${b.name} — ${fmtBDT(b.amount, bn)} পরিশোধ করবেন?` : `Pay ${b.name} — ${fmtBDT(b.amount)}?`)) return;
    const now = new Date().toISOString();
    const { error: txErr } = await supabase.from("finance_transactions").insert({
      user_id: userId,
      wallet_id: b.wallet_id,
      type: "expense",
      amount: b.amount,
      category: b.category,
      scope: b.scope,
      note: `${bn ? "মাসিক বিল" : "Monthly bill"}: ${b.name}${b.note ? " — " + b.note : ""}`,
      occurred_at: now,
    } as any);
    if (txErr) return toast.error(txErr.message);
    await (supabase as any).from("finance_recurring_bills").update({ last_paid_at: now }).eq("id", b.id);
    toast.success(bn ? "পরিশোধ সম্পন্ন" : "Paid");
    load(); onPaid?.();
  };

  const mKey = currentMonthKey();
  const enriched = bills.map(b => ({
    ...b,
    paidThisMonth: b.last_paid_at ? monthKey(b.last_paid_at) === mKey : false,
  }));

  const activeBills = enriched.filter(b => b.is_active);
  const monthlyTotal = activeBills.reduce((s, b) => s + Number(b.amount), 0);
  const paidTotal = activeBills.filter(b => b.paidThisMonth).reduce((s, b) => s + Number(b.amount), 0);
  const dueTotal = monthlyTotal - paidTotal;
  const today = new Date().getDate();

  const sorted = useMemo(() => {
    return [...enriched].sort((a, b) => {
      if (a.paidThisMonth !== b.paidThisMonth) return a.paidThisMonth ? 1 : -1;
      return a.due_day - b.due_day;
    });
  }, [enriched]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Repeat className="h-3 w-3"/>{bn ? "মাসিক মোট" : "Monthly total"}</div>
          <div className="text-lg font-bold">{fmtBDT(monthlyTotal, bn)}</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/>{bn ? "পরিশোধিত" : "Paid"}</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmtBDT(paidTotal, bn)}</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Circle className="h-3 w-3"/>{bn ? "বাকি" : "Due"}</div>
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{fmtBDT(dueTotal, bn)}</div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-sky-500/10 to-sky-500/5 border-sky-500/20">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><CalendarClock className="h-3 w-3"/>{bn ? "সক্রিয় বিল" : "Active bills"}</div>
          <div className="text-lg font-bold">{activeBills.length}</div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Repeat className="h-4 w-4 text-primary" />
            {bn ? "প্রতি মাসের নিয়মিত খরচ" : "Recurring Monthly Bills"}
          </h3>
          <p className="text-xs text-muted-foreground">{bn ? "বাড়ি ভাড়া, WiFi, মোবাইল বিল, কিস্তি ইত্যাদি একবার সেট করুন — প্রতি মাসে এক ক্লিকে পরিশোধ" : "Set once, pay in one click each month"}</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> {bn ? "নতুন" : "Add"}
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : sorted.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Repeat className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">{bn ? "কোন নিয়মিত বিল নেই" : "No recurring bills yet"}</p>
          <Button onClick={openAdd} size="sm" variant="outline"><Plus className="h-4 w-4 mr-1"/>{bn ? "প্রথম বিল যোগ করুন" : "Add first bill"}</Button>
        </Card>
      ) : (
        <div className="grid gap-2">
          {sorted.map((b, i) => {
            const Icon = iconFor(b.name + " " + (b.category || ""));
            const wallet = wallets.find(w => w.id === b.wallet_id);
            const overdue = !b.paidThisMonth && b.due_day < today && b.is_active;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className={cn(
                  "p-3 flex items-center gap-3 transition-colors",
                  !b.is_active && "opacity-60",
                  b.paidThisMonth && "bg-emerald-500/5 border-emerald-500/20",
                  overdue && "bg-red-500/5 border-red-500/30",
                )}>
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    b.paidThisMonth ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : overdue ? "bg-red-500/15 text-red-600 dark:text-red-400"
                    : "bg-primary/10 text-primary"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-sm truncate">{b.name}</div>
                      {b.paidThisMonth && <Badge variant="outline" className="h-5 text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400">{bn ? "পরিশোধিত" : "Paid"}</Badge>}
                      {overdue && <Badge variant="destructive" className="h-5 text-[10px]">{bn ? "সময় পার" : "Overdue"}</Badge>}
                      {!b.is_active && <Badge variant="secondary" className="h-5 text-[10px]">{bn ? "নিষ্ক্রিয়" : "Off"}</Badge>}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {bn ? `প্রতি মাসের ${b.due_day} তারিখ` : `Day ${b.due_day} of month`}
                      {b.category && ` • ${b.category}`}
                      {wallet && ` • ${wallet.name}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm">{fmtBDT(b.amount, bn)}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!b.paidThisMonth && b.is_active && (
                      <Button size="sm" variant="default" className="h-8 px-2 text-xs" onClick={() => payNow(b)}>
                        <CheckCircle2 className="h-3.5 w-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">{bn ? "পরিশোধ" : "Pay"}</span>
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(b)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(b)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? (bn ? "বিল এডিট" : "Edit Bill") : (bn ? "নতুন নিয়মিত বিল" : "New Recurring Bill")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{bn ? "নাম" : "Name"}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder={bn ? "যেমন: বাড়ি ভাড়া" : "e.g. House Rent"} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "টাকা" : "Amount"}</Label>
                <Input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "মাসের কত তারিখ" : "Day of month"}</Label>
                <Input type="number" min={1} max={31} value={dueDay} onChange={e => setDueDay(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">{bn ? "ক্যাটাগরি" : "Category"}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "স্কোপ" : "Scope"}</Label>
                <Select value={scope} onValueChange={(v: any) => setScope(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">{bn ? "ব্যক্তিগত" : "Personal"}</SelectItem>
                    <SelectItem value="business">{bn ? "ব্যবসা" : "Business"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{bn ? "ওয়ালেট" : "Wallet"}</Label>
                <Select value={walletId} onValueChange={setWalletId}>
                  <SelectTrigger><SelectValue placeholder={bn ? "নির্বাচন" : "Select"} /></SelectTrigger>
                  <SelectContent>
                    {wallets.filter(w => w.scope === scope || scope === "personal").map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">{bn ? "নোট (ঐচ্ছিক)" : "Note (optional)"}</Label>
              <Textarea rows={2} value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="flex items-center justify-between pt-1">
              <Label className="text-sm">{bn ? "সক্রিয়" : "Active"}</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>{bn ? "বাতিল" : "Cancel"}</Button>
              <Button className="flex-1" onClick={save} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {bn ? "সংরক্ষণ" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
