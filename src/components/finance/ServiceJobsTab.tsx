import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus, Wrench, Smartphone, Loader2, Trash2, CheckCircle2, Clock,
  User as UserIcon, Phone, CalendarClock, Receipt, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Status = "received" | "in_progress" | "done" | "delivered" | "cancelled";
type PayStatus = "pending" | "partial" | "paid";
type JobType = "repair" | "sale";

interface JobRow {
  id: string;
  job_type: JobType;
  service_kind: string | null;
  item_name: string;
  item_identity: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  received_at: string;
  promised_at: string | null;
  delivered_at: string | null;
  charge_amount: number;
  cost_amount: number;
  advance_amount: number;
  paid_amount: number;
  status: Status;
  payment_status: PayStatus;
  note: string | null;
}

const KIND_OPTIONS_REPAIR = [
  "Screen Repair", "Battery Change", "Charging Port", "Software Issue",
  "Lock Unlock", "FRP Unlock", "Root", "MDM Bypass", "iCloud Bypass",
  "Flash / Firmware", "Water Damage", "Other",
];
const KIND_OPTIONS_SALE = ["New Sale", "Used Sale", "Accessory Sale", "Trade-in", "Other"];

const KIND_BN: Record<string, string> = {
  "Screen Repair": "স্ক্রিন মেরামত", "Battery Change": "ব্যাটারি পরিবর্তন",
  "Charging Port": "চার্জিং পোর্ট", "Software Issue": "সফটওয়্যার সমস্যা",
  "Lock Unlock": "লক খোলা", "FRP Unlock": "FRP খোলা", "Root": "রুট",
  "MDM Bypass": "MDM বাইপাস", "iCloud Bypass": "iCloud বাইপাস",
  "Flash / Firmware": "ফ্ল্যাশ/ফার্মওয়্যার", "Water Damage": "পানি ক্ষতি",
  "New Sale": "নতুন বিক্রি", "Used Sale": "পুরাতন বিক্রি",
  "Accessory Sale": "এক্সেসরিজ বিক্রি", "Trade-in": "এক্সচেঞ্জ",
  "Other": "অন্যান্য",
};

const STATUS_BN: Record<Status, string> = {
  received: "গ্রহণ", in_progress: "কাজ চলছে", done: "সম্পন্ন",
  delivered: "ডেলিভারি", cancelled: "বাতিল",
};
const PAY_BN: Record<PayStatus, string> = {
  pending: "বাকি", partial: "আংশিক", paid: "পরিশোধিত",
};

const fmtBDT = (n: number, bn = false) => {
  const abs = Math.abs(n);
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(abs);
  return `${n < 0 ? "-" : ""}৳${s}`;
};

const fmtDate = (iso: string | null, bn = false) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(bn ? "bn-BD" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const nowLocalInput = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const emptyForm = () => ({
  id: "",
  job_type: "repair" as JobType,
  service_kind: "",
  item_name: "",
  item_identity: "",
  customer_name: "",
  customer_phone: "",
  received_at: nowLocalInput(),
  promised_at: "",
  delivered_at: "",
  charge_amount: "",
  cost_amount: "",
  advance_amount: "",
  paid_amount: "",
  status: "received" as Status,
  payment_status: "pending" as PayStatus,
  note: "",
});

export function ServiceJobsTab({ userId, bn }: { userId: string; bn: boolean }) {
  const [rows, setRows] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_jobs")
      .select("*")
      .eq("user_id", userId)
      .order("received_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as any) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const startNew = () => { setForm(emptyForm()); setOpen(true); };
  const startEdit = (r: JobRow) => {
    setForm({
      id: r.id,
      job_type: r.job_type,
      service_kind: r.service_kind ?? "",
      item_name: r.item_name,
      item_identity: r.item_identity ?? "",
      customer_name: r.customer_name ?? "",
      customer_phone: r.customer_phone ?? "",
      received_at: r.received_at ? r.received_at.slice(0, 16) : nowLocalInput(),
      promised_at: r.promised_at ? r.promised_at.slice(0, 16) : "",
      delivered_at: r.delivered_at ? r.delivered_at.slice(0, 16) : "",
      charge_amount: String(r.charge_amount || ""),
      cost_amount: String(r.cost_amount || ""),
      advance_amount: String(r.advance_amount || ""),
      paid_amount: String(r.paid_amount || ""),
      status: r.status,
      payment_status: r.payment_status,
      note: r.note ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.item_name.trim()) {
      toast.error(bn ? "জিনিসের নাম দিন" : "Enter item name");
      return;
    }
    setBusy(true);
    const charge = Number(form.charge_amount) || 0;
    const cost = Number(form.cost_amount) || 0;
    const advance = Number(form.advance_amount) || 0;
    const paid = Number(form.paid_amount) || advance;
    let payStatus: PayStatus = "pending";
    if (paid <= 0) payStatus = "pending";
    else if (paid >= charge && charge > 0) payStatus = "paid";
    else payStatus = "partial";

    const payload: any = {
      user_id: userId,
      job_type: form.job_type,
      service_kind: form.service_kind || null,
      item_name: form.item_name.trim(),
      item_identity: form.item_identity.trim() || null,
      customer_name: form.customer_name.trim() || null,
      customer_phone: form.customer_phone.trim() || null,
      received_at: form.received_at ? new Date(form.received_at).toISOString() : new Date().toISOString(),
      promised_at: form.promised_at ? new Date(form.promised_at).toISOString() : null,
      delivered_at: form.delivered_at ? new Date(form.delivered_at).toISOString() : null,
      charge_amount: charge,
      cost_amount: cost,
      advance_amount: advance,
      paid_amount: paid,
      status: form.status,
      payment_status: payStatus,
      note: form.note.trim() || null,
    };

    const { error } = form.id
      ? await supabase.from("service_jobs").update(payload).eq("id", form.id)
      : await supabase.from("service_jobs").insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "সংরক্ষিত" : "Saved");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(bn ? "মুছে ফেলবেন?" : "Delete this job?")) return;
    const { error } = await supabase.from("service_jobs").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "মুছে ফেলা হয়েছে" : "Deleted");
    load();
  };

  const markDelivered = async (r: JobRow) => {
    const { error } = await supabase.from("service_jobs").update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "ডেলিভারি সম্পন্ন" : "Marked delivered");
    load();
  };

  const filtered = useMemo(() => {
    let list = rows;
    if (statusFilter !== "all") list = list.filter(r => r.status === statusFilter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(r =>
        r.item_name.toLowerCase().includes(s) ||
        (r.item_identity ?? "").toLowerCase().includes(s) ||
        (r.customer_name ?? "").toLowerCase().includes(s) ||
        (r.customer_phone ?? "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [rows, q, statusFilter]);

  const summary = useMemo(() => {
    let totalCharge = 0, totalCost = 0, totalPaid = 0, totalDue = 0;
    let pendingCount = 0, deliveredCount = 0;
    for (const r of rows) {
      totalCharge += Number(r.charge_amount || 0);
      totalCost += Number(r.cost_amount || 0);
      totalPaid += Number(r.paid_amount || 0);
      totalDue += Math.max(0, Number(r.charge_amount || 0) - Number(r.paid_amount || 0));
      if (r.status === "delivered") deliveredCount++;
      else if (r.status !== "cancelled") pendingCount++;
    }
    return {
      totalCharge, totalCost, profit: totalCharge - totalCost,
      totalPaid, totalDue, pendingCount, deliveredCount,
    };
  }, [rows]);

  const kindOptions = form.job_type === "sale" ? KIND_OPTIONS_SALE : KIND_OPTIONS_REPAIR;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground">{bn ? "মোট চার্জ" : "Total Charge"}</p>
          <p className="text-lg font-semibold tabular-nums">{fmtBDT(summary.totalCharge, bn)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground">{bn ? "খরচ" : "Cost"}</p>
          <p className="text-lg font-semibold tabular-nums text-rose-500">{fmtBDT(summary.totalCost, bn)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground">{bn ? "লাভ" : "Profit"}</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-500">{fmtBDT(summary.profit, bn)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground">{bn ? "বাকি" : "Due"}</p>
          <p className="text-lg font-semibold tabular-nums text-amber-500">{fmtBDT(summary.totalDue, bn)}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder={bn ? "খুঁজুন (নাম/আইএমইআই/গ্রাহক)" : "Search (item / IMEI / customer)"}
            className="pl-8 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-9 w-[130px]"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{bn ? "সব" : "All"}</SelectItem>
            {(["received", "in_progress", "done", "delivered", "cancelled"] as Status[]).map(s => (
              <SelectItem key={s} value={s}>{bn ? STATUS_BN[s] : s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={startNew} className="h-9">
          <Plus className="h-4 w-4 mr-1" />{bn ? "নতুন কাজ" : "New Job"}
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid place-items-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Wrench className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {bn ? "কোনো কাজ নেই। উপরে থেকে নতুন কাজ যোগ করুন।" : "No jobs yet. Add one from above."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const due = Math.max(0, Number(r.charge_amount || 0) - Number(r.paid_amount || 0));
            const profit = Number(r.charge_amount || 0) - Number(r.cost_amount || 0);
            const isRepair = r.job_type === "repair";
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => startEdit(r)}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                      isRepair ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {isRepair ? <Wrench className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{r.item_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {r.service_kind ? (bn ? (KIND_BN[r.service_kind] ?? r.service_kind) : r.service_kind) : (bn ? "সাধারণ" : "General")}
                            {r.item_identity && <> · <span className="font-mono">{r.item_identity}</span></>}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge variant={r.status === "delivered" ? "default" : "secondary"} className="text-[10px]">
                            {bn ? STATUS_BN[r.status] : r.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            "text-[10px]",
                            r.payment_status === "paid" && "border-emerald-500/40 text-emerald-500",
                            r.payment_status === "partial" && "border-amber-500/40 text-amber-500",
                            r.payment_status === "pending" && "border-rose-500/40 text-rose-500",
                          )}>
                            {bn ? PAY_BN[r.payment_status] : r.payment_status}
                          </Badge>
                        </div>
                      </div>

                      {(r.customer_name || r.customer_phone) && (
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                          {r.customer_name && <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" />{r.customer_name}</span>}
                          {r.customer_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.customer_phone}</span>}
                        </div>
                      )}

                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <p className="text-muted-foreground">{bn ? "গ্রহণ" : "Received"}</p>
                          <p className="font-medium">{fmtDate(r.received_at, bn)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{bn ? "ডেলিভারি" : "Delivered"}</p>
                          <p className="font-medium">{fmtDate(r.delivered_at, bn)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{bn ? "লাভ" : "Profit"}</p>
                          <p className={cn("font-semibold tabular-nums", profit >= 0 ? "text-emerald-500" : "text-rose-500")}>{fmtBDT(profit, bn)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{bn ? "বাকি" : "Due"}</p>
                          <p className="font-semibold tabular-nums text-amber-500">{fmtBDT(due, bn)}</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {r.status !== "delivered" && r.status !== "cancelled" && (
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => markDelivered(r)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />{bn ? "ডেলিভারি দিন" : "Mark Delivered"}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] text-rose-500 ml-auto" onClick={() => remove(r.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {form.id ? (bn ? "কাজ সম্পাদনা" : "Edit Job") : (bn ? "নতুন কাজ" : "New Job")}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "ধরন" : "Type"}</Label>
                <Select value={form.job_type} onValueChange={(v) => setForm(f => ({ ...f, job_type: v as JobType, service_kind: "" }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">{bn ? "মেরামত/সার্ভিস" : "Repair / Service"}</SelectItem>
                    <SelectItem value="sale">{bn ? "ক্রয়/বিক্রয়" : "Buy / Sell"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{bn ? "কাজের ধরন" : "Service Kind"}</Label>
                <Select value={form.service_kind} onValueChange={(v) => setForm(f => ({ ...f, service_kind: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder={bn ? "বেছে নিন" : "Select"} /></SelectTrigger>
                  <SelectContent>
                    {kindOptions.map(k => (
                      <SelectItem key={k} value={k}>{bn ? (KIND_BN[k] ?? k) : k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "জিনিসের নাম *" : "Item Name *"}</Label>
                <Input value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} placeholder={bn ? "যেমন: iPhone 12" : "e.g. iPhone 12"} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "আইডেন্টিটি (IMEI/সিরিয়াল)" : "Identity (IMEI/Serial)"}</Label>
                <Input value={form.item_identity} onChange={e => setForm(f => ({ ...f, item_identity: e.target.value }))} placeholder="IMEI / SN" className="h-9 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "গ্রাহকের নাম" : "Customer Name"}</Label>
                <Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "মোবাইল" : "Phone"}</Label>
                <Input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} className="h-9" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">{bn ? "গ্রহণ" : "Received"}</Label>
                <Input type="datetime-local" value={form.received_at} onChange={e => setForm(f => ({ ...f, received_at: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "প্রতিশ্রুত" : "Promised"}</Label>
                <Input type="datetime-local" value={form.promised_at} onChange={e => setForm(f => ({ ...f, promised_at: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "ডেলিভারি" : "Delivered"}</Label>
                <Input type="datetime-local" value={form.delivered_at} onChange={e => setForm(f => ({ ...f, delivered_at: e.target.value }))} className="h-9" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{bn ? "চার্জ (গ্রাহকের কাছ থেকে)" : "Charge (from customer)"}</Label>
                <Input type="number" inputMode="decimal" value={form.charge_amount} onChange={e => setForm(f => ({ ...f, charge_amount: e.target.value }))} className="h-9 tabular-nums" placeholder="0" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "খরচ (পার্টস/সার্ভিস)" : "Cost (parts/service)"}</Label>
                <Input type="number" inputMode="decimal" value={form.cost_amount} onChange={e => setForm(f => ({ ...f, cost_amount: e.target.value }))} className="h-9 tabular-nums" placeholder="0" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "অগ্রিম" : "Advance"}</Label>
                <Input type="number" inputMode="decimal" value={form.advance_amount} onChange={e => setForm(f => ({ ...f, advance_amount: e.target.value }))} className="h-9 tabular-nums" placeholder="0" />
              </div>
              <div>
                <Label className="text-xs">{bn ? "মোট পরিশোধিত" : "Total Paid"}</Label>
                <Input type="number" inputMode="decimal" value={form.paid_amount} onChange={e => setForm(f => ({ ...f, paid_amount: e.target.value }))} className="h-9 tabular-nums" placeholder="0" />
              </div>
            </div>

            <div>
              <Label className="text-xs">{bn ? "স্ট্যাটাস" : "Status"}</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as Status }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["received", "in_progress", "done", "delivered", "cancelled"] as Status[]).map(s => (
                    <SelectItem key={s} value={s}>{bn ? STATUS_BN[s] : s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">{bn ? "নোট" : "Note"}</Label>
              <Textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} placeholder={bn ? "সমস্যা / বিবরণ" : "Problem / details"} />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>{bn ? "বাতিল" : "Cancel"}</Button>
              <Button className="flex-1" onClick={save} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Receipt className="h-4 w-4 mr-1" />{bn ? "সংরক্ষণ" : "Save"}</>}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ServiceJobsTab;
