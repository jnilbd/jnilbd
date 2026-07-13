import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Plus, Package, Loader2, Trash2, CheckCircle2, Wrench, AlertTriangle,
  User as UserIcon, Phone, Search, Filter, DollarSign, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Status = "owned" | "needs_repair" | "in_repair" | "repaired" | "listed" | "sold" | "scrap";
type Condition = "good" | "minor_issue" | "broken" | "dead";

interface AssetRow {
  id: string;
  name: string;
  identity: string | null;
  category: string | null;
  condition: Condition;
  source_name: string | null;
  source_phone: string | null;
  acquired_at: string | null;
  acquire_cost: number;
  issue_description: string | null;
  repair_needed: boolean;
  repair_details: string | null;
  estimated_repair_cost: number;
  actual_repair_cost: number;
  repaired_at: string | null;
  expected_value: number;
  sold_price: number;
  sold_at: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  status: Status;
  note: string | null;
}

const CATEGORIES = ["Phone", "Laptop", "Tablet", "TV", "Appliance", "Furniture", "Vehicle", "Accessory", "Tool", "Other"];
const CAT_BN: Record<string, string> = {
  Phone: "ফোন", Laptop: "ল্যাপটপ", Tablet: "ট্যাবলেট", TV: "টিভি",
  Appliance: "যন্ত্রপাতি", Furniture: "আসবাবপত্র", Vehicle: "যানবাহন",
  Accessory: "এক্সেসরিজ", Tool: "টুল", Other: "অন্যান্য",
};

const STATUS_BN: Record<Status, string> = {
  owned: "মালিকানাধীন", needs_repair: "মেরামত দরকার", in_repair: "মেরামতে",
  repaired: "মেরামত সম্পন্ন", listed: "বিক্রির জন্য", sold: "বিক্রিত", scrap: "স্ক্র্যাপ",
};
const COND_BN: Record<Condition, string> = {
  good: "ভালো", minor_issue: "সামান্য সমস্যা", broken: "নষ্ট", dead: "মৃত/অচল",
};

const STATUS_TONE: Record<Status, string> = {
  owned: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  needs_repair: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  in_repair: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  repaired: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  listed: "bg-violet-500/10 text-violet-500 border-violet-500/30",
  sold: "bg-slate-500/10 text-slate-500 border-slate-500/30",
  scrap: "bg-rose-500/10 text-rose-500 border-rose-500/30",
};

const fmtBDT = (n: number, bn = false) => {
  const abs = Math.abs(n);
  const s = new Intl.NumberFormat(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 0 }).format(abs);
  return `${n < 0 ? "-" : ""}৳${s}`;
};
const fmtDate = (iso: string | null, bn = false) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(bn ? "bn-BD" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const nowLocalInput = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const emptyForm = () => ({
  id: "",
  name: "",
  identity: "",
  category: "",
  condition: "good" as Condition,
  source_name: "",
  source_phone: "",
  acquired_at: nowLocalInput(),
  acquire_cost: "",
  issue_description: "",
  repair_needed: false,
  repair_details: "",
  estimated_repair_cost: "",
  actual_repair_cost: "",
  repaired_at: "",
  expected_value: "",
  sold_price: "",
  sold_at: "",
  buyer_name: "",
  buyer_phone: "",
  status: "owned" as Status,
  note: "",
});

export function AssetsTab({ userId, bn }: { userId: string; bn: boolean }) {
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("owned_assets" as any)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as any) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const startNew = () => { setForm(emptyForm()); setOpen(true); };
  const startEdit = (r: AssetRow) => {
    setForm({
      id: r.id,
      name: r.name,
      identity: r.identity ?? "",
      category: r.category ?? "",
      condition: r.condition,
      source_name: r.source_name ?? "",
      source_phone: r.source_phone ?? "",
      acquired_at: r.acquired_at ? r.acquired_at.slice(0, 16) : "",
      acquire_cost: String(r.acquire_cost || ""),
      issue_description: r.issue_description ?? "",
      repair_needed: r.repair_needed,
      repair_details: r.repair_details ?? "",
      estimated_repair_cost: String(r.estimated_repair_cost || ""),
      actual_repair_cost: String(r.actual_repair_cost || ""),
      repaired_at: r.repaired_at ? r.repaired_at.slice(0, 16) : "",
      expected_value: String(r.expected_value || ""),
      sold_price: String(r.sold_price || ""),
      sold_at: r.sold_at ? r.sold_at.slice(0, 16) : "",
      buyer_name: r.buyer_name ?? "",
      buyer_phone: r.buyer_phone ?? "",
      status: r.status,
      note: r.note ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error(bn ? "নাম দিন" : "Enter name"); return; }
    setBusy(true);
    const payload: any = {
      user_id: userId,
      name: form.name.trim(),
      identity: form.identity.trim() || null,
      category: form.category || null,
      condition: form.condition,
      source_name: form.source_name.trim() || null,
      source_phone: form.source_phone.trim() || null,
      acquired_at: form.acquired_at ? new Date(form.acquired_at).toISOString() : null,
      acquire_cost: Number(form.acquire_cost) || 0,
      issue_description: form.issue_description.trim() || null,
      repair_needed: form.repair_needed,
      repair_details: form.repair_details.trim() || null,
      estimated_repair_cost: Number(form.estimated_repair_cost) || 0,
      actual_repair_cost: Number(form.actual_repair_cost) || 0,
      repaired_at: form.repaired_at ? new Date(form.repaired_at).toISOString() : null,
      expected_value: Number(form.expected_value) || 0,
      sold_price: Number(form.sold_price) || 0,
      sold_at: form.sold_at ? new Date(form.sold_at).toISOString() : null,
      buyer_name: form.buyer_name.trim() || null,
      buyer_phone: form.buyer_phone.trim() || null,
      status: form.status,
      note: form.note.trim() || null,
    };
    const { error } = form.id
      ? await supabase.from("owned_assets" as any).update(payload).eq("id", form.id)
      : await supabase.from("owned_assets" as any).insert(payload);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "সংরক্ষিত" : "Saved");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(bn ? "মুছে ফেলবেন?" : "Delete this asset?")) return;
    const { error } = await supabase.from("owned_assets" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "মুছে ফেলা হয়েছে" : "Deleted");
    load();
  };

  const markSold = async (r: AssetRow) => {
    const priceStr = prompt(bn ? "বিক্রয় মূল্য (৳)?" : "Sold price (৳)?", String(r.expected_value || ""));
    if (priceStr === null) return;
    const price = Number(priceStr) || 0;
    const { error } = await supabase.from("owned_assets" as any).update({
      status: "sold", sold_price: price, sold_at: new Date().toISOString(),
    }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success(bn ? "বিক্রিত হিসেবে চিহ্নিত" : "Marked sold");
    load();
  };

  const filtered = useMemo(() => {
    let list = rows;
    if (statusFilter !== "all") list = list.filter(r => r.status === statusFilter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(s) ||
        (r.identity ?? "").toLowerCase().includes(s) ||
        (r.source_name ?? "").toLowerCase().includes(s) ||
        (r.category ?? "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [rows, q, statusFilter]);

  const summary = useMemo(() => {
    let assetValue = 0, repairPending = 0, expectedRecover = 0, sold = 0, profit = 0, needsRepair = 0;
    for (const r of rows) {
      const acquire = Number(r.acquire_cost || 0);
      const estRepair = Number(r.estimated_repair_cost || 0);
      const actRepair = Number(r.actual_repair_cost || 0);
      const expected = Number(r.expected_value || 0);
      const soldP = Number(r.sold_price || 0);
      if (r.status === "sold") {
        sold += soldP;
        profit += soldP - acquire - actRepair;
      } else {
        assetValue += acquire + actRepair;
        if (r.repair_needed && r.status !== "repaired") {
          repairPending += Math.max(0, estRepair - actRepair);
          needsRepair++;
        }
        expectedRecover += expected;
      }
    }
    return { assetValue, repairPending, expectedRecover, sold, profit, needsRepair };
  }, [rows]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground">{bn ? "সম্পদের মূল্য" : "Asset Value"}</p>
          <p className="text-lg font-semibold tabular-nums">{fmtBDT(summary.assetValue, bn)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground">{bn ? "মেরামত বাকি" : "Repair Pending"}</p>
          <p className="text-lg font-semibold tabular-nums text-amber-500">{fmtBDT(summary.repairPending, bn)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{summary.needsRepair} {bn ? "টি" : "items"}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground">{bn ? "প্রত্যাশিত আয়" : "Expected Recover"}</p>
          <p className="text-lg font-semibold tabular-nums text-cyan-500">{fmtBDT(summary.expectedRecover, bn)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[10px] text-muted-foreground">{bn ? "মোট লাভ (বিক্রিত)" : "Total Profit (Sold)"}</p>
          <p className={cn("text-lg font-semibold tabular-nums", summary.profit >= 0 ? "text-emerald-500" : "text-rose-500")}>{fmtBDT(summary.profit, bn)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{bn ? "বিক্রি" : "Sold"} {fmtBDT(summary.sold, bn)}</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder={bn ? "খুঁজুন (নাম/সিরিয়াল/দাতা)" : "Search (name / serial / source)"}
            className="pl-8 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-9 w-[150px]"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{bn ? "সব" : "All"}</SelectItem>
            {(Object.keys(STATUS_BN) as Status[]).map(s => (
              <SelectItem key={s} value={s}>{bn ? STATUS_BN[s] : s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={startNew} className="h-9">
          <Plus className="h-4 w-4 mr-1" />{bn ? "নতুন সম্পদ" : "New Asset"}
        </Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {bn ? "কোনো সম্পদ যোগ করা হয়নি। উপরে থেকে যোগ করুন।" : "No assets added yet. Add one from above."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const totalCost = Number(r.acquire_cost || 0) + Number(r.actual_repair_cost || 0);
            const net = r.status === "sold"
              ? Number(r.sold_price || 0) - totalCost
              : Number(r.expected_value || 0) - totalCost - Math.max(0, Number(r.estimated_repair_cost || 0) - Number(r.actual_repair_cost || 0));
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => startEdit(r)}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                      r.condition === "good" ? "bg-emerald-500/10 text-emerald-500" :
                      r.condition === "minor_issue" ? "bg-amber-500/10 text-amber-500" :
                      "bg-rose-500/10 text-rose-500"
                    )}>
                      {r.repair_needed ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{r.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {r.category ? (bn ? (CAT_BN[r.category] ?? r.category) : r.category) : (bn ? "সাধারণ" : "General")}
                            {r.identity && <> · <span className="font-mono">{r.identity}</span></>}
                            {" · "}{bn ? COND_BN[r.condition] : r.condition.replace("_"," ")}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0", STATUS_TONE[r.status])}>
                          {bn ? STATUS_BN[r.status] : r.status.replace("_", " ")}
                        </Badge>
                      </div>

                      {(r.source_name || r.source_phone) && (
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                          {r.source_name && <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" />{r.source_name}</span>}
                          {r.source_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.source_phone}</span>}
                          <span>· {fmtDate(r.acquired_at, bn)}</span>
                        </div>
                      )}

                      {r.repair_needed && r.repair_details && (
                        <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="truncate">{r.repair_details}</span>
                        </p>
                      )}

                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <p className="text-muted-foreground">{bn ? "ক্রয় মূল্য" : "Acquire"}</p>
                          <p className="font-medium tabular-nums">{fmtBDT(Number(r.acquire_cost||0), bn)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{bn ? "মেরামত (আসল/আনু.)" : "Repair (act/est)"}</p>
                          <p className="font-medium tabular-nums">
                            {fmtBDT(Number(r.actual_repair_cost||0), bn)}
                            <span className="text-muted-foreground"> / {fmtBDT(Number(r.estimated_repair_cost||0), bn)}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{r.status === "sold" ? (bn ? "বিক্রয় মূল্য" : "Sold Price") : (bn ? "প্রত্যাশিত মূল্য" : "Expected")}</p>
                          <p className="font-medium tabular-nums text-cyan-500">
                            {fmtBDT(r.status === "sold" ? Number(r.sold_price||0) : Number(r.expected_value||0), bn)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{bn ? "নেট" : "Net"}</p>
                          <p className={cn("font-semibold tabular-nums", net >= 0 ? "text-emerald-500" : "text-rose-500")}>{fmtBDT(net, bn)}</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {r.status !== "sold" && r.status !== "scrap" && (
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => markSold(r)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />{bn ? "বিক্রি হয়েছে" : "Mark Sold"}
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

      {/* Add/Edit sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{form.id ? (bn ? "সম্পদ সম্পাদনা" : "Edit Asset") : (bn ? "নতুন সম্পদ" : "New Asset")}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {/* Basics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">{bn ? "জিনিসের নাম *" : "Item Name *"}</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={bn ? "যেমন: Samsung A52" : "e.g. Samsung A52"} />
              </div>
              <div>
                <Label className="text-xs">{bn ? "সিরিয়াল/আইএমইআই" : "Serial/IMEI"}</Label>
                <Input value={form.identity} onChange={e => setForm({ ...form, identity: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">{bn ? "ক্যাটাগরি" : "Category"}</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder={bn ? "নির্বাচন করুন" : "Select"} /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{bn ? CAT_BN[c] : c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{bn ? "অবস্থা" : "Condition"}</Label>
                <Select value={form.condition} onValueChange={v => setForm({ ...form, condition: v as Condition })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(COND_BN) as Condition[]).map(c => <SelectItem key={c} value={c}>{bn ? COND_BN[c] : c.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{bn ? "স্ট্যাটাস" : "Status"}</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Status })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(STATUS_BN) as Status[]).map(s => <SelectItem key={s} value={s}>{bn ? STATUS_BN[s] : s.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Source */}
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">{bn ? "কে দিয়েছে / কোথা থেকে" : "Source"}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{bn ? "দাতা/বিক্রেতার নাম" : "Source Name"}</Label>
                  <Input value={form.source_name} onChange={e => setForm({ ...form, source_name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "ফোন" : "Phone"}</Label>
                  <Input value={form.source_phone} onChange={e => setForm({ ...form, source_phone: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "গ্রহণের তারিখ" : "Acquired At"}</Label>
                  <Input type="datetime-local" value={form.acquired_at} onChange={e => setForm({ ...form, acquired_at: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "ক্রয় মূল্য (৳)" : "Acquire Cost (৳)"}</Label>
                  <Input inputMode="decimal" value={form.acquire_cost} onChange={e => setForm({ ...form, acquire_cost: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Repair */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">{bn ? "মেরামত তথ্য" : "Repair Info"}</p>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">{bn ? "মেরামত দরকার" : "Needs Repair"}</Label>
                  <Switch checked={form.repair_needed} onCheckedChange={v => setForm({ ...form, repair_needed: v })} />
                </div>
              </div>
              {form.repair_needed && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">{bn ? "সমস্যা / কি মেরামত হবে" : "Issue / What to repair"}</Label>
                    <Textarea rows={2} value={form.repair_details} onChange={e => setForm({ ...form, repair_details: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">{bn ? "আনুমানিক খরচ (৳)" : "Estimated Cost (৳)"}</Label>
                    <Input inputMode="decimal" value={form.estimated_repair_cost} onChange={e => setForm({ ...form, estimated_repair_cost: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">{bn ? "প্রকৃত খরচ (৳)" : "Actual Cost (৳)"}</Label>
                    <Input inputMode="decimal" value={form.actual_repair_cost} onChange={e => setForm({ ...form, actual_repair_cost: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">{bn ? "মেরামত সম্পন্ন তারিখ" : "Repaired At"}</Label>
                    <Input type="datetime-local" value={form.repaired_at} onChange={e => setForm({ ...form, repaired_at: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* Value & Sale */}
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">{bn ? "মূল্য ও বিক্রয়" : "Value & Sale"}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">{bn ? "প্রত্যাশিত বিক্রয় মূল্য (৳)" : "Expected Sale Value (৳)"}</Label>
                  <Input inputMode="decimal" value={form.expected_value} onChange={e => setForm({ ...form, expected_value: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "বিক্রয় মূল্য (৳)" : "Sold Price (৳)"}</Label>
                  <Input inputMode="decimal" value={form.sold_price} onChange={e => setForm({ ...form, sold_price: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "বিক্রয়ের তারিখ" : "Sold At"}</Label>
                  <Input type="datetime-local" value={form.sold_at} onChange={e => setForm({ ...form, sold_at: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "ক্রেতার নাম" : "Buyer Name"}</Label>
                  <Input value={form.buyer_name} onChange={e => setForm({ ...form, buyer_name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">{bn ? "ক্রেতার ফোন" : "Buyer Phone"}</Label>
                  <Input value={form.buyer_phone} onChange={e => setForm({ ...form, buyer_phone: e.target.value })} />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs">{bn ? "নোট" : "Note"}</Label>
              <Textarea rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>

            <div className="flex gap-2 pt-2 sticky bottom-0 bg-background pb-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">{bn ? "বাতিল" : "Cancel"}</Button>
              <Button onClick={save} disabled={busy} className="flex-1">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {bn ? "সংরক্ষণ" : "Save"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
