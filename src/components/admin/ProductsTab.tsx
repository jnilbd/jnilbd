import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Search, Trash2, Pencil, Package, Zap, Sparkles } from "lucide-react";
import { money, logAudit } from "./shared";

const empty = {
  name: "", name_bn: "", slug: "", category: "", product_type: "physical",
  short_description: "", short_description_bn: "", full_description: "", full_description_bn: "",
  price: 0, discount_price: null as any, stock: 0, image: "", badge: "", badge_color: "red",
  digital_delivery_info: "", is_active: true, is_featured: false, offer_enabled: false,
};

export default function ProductsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [editing, setEditing] = useState<any | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("shop_products").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))), [rows]);

  const filtered = rows.filter((r) => {
    const t = q.toLowerCase();
    return (!t || [r.name, r.name_bn, r.category].some((v: any) => String(v || "").toLowerCase().includes(t)))
      && (type === "all" || r.product_type === type);
  });

  const save = async () => {
    const payload = { ...editing };
    delete payload.created_at; delete payload.updated_at;
    payload.price = Number(payload.price || 0);
    payload.discount_price = payload.discount_price ? Number(payload.discount_price) : null;
    payload.stock = Number(payload.stock || 0);
    if (!payload.name) return toast.error("নাম দিন");
    let res;
    if (payload.id) res = await supabase.from("shop_products").update(payload).eq("id", payload.id);
    else { delete payload.id; res = await supabase.from("shop_products").insert(payload); }
    if (res.error) return toast.error(res.error.message);
    logAudit(payload.id ? "product_update" : "product_create", "shop_products", payload.id, { name: payload.name });
    toast.success("সেভ হয়েছে");
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from("shop_products").delete().eq("id", id);
    logAudit("product_delete", "shop_products", id);
    load();
  };

  const toggle = async (r: any, field: string) => {
    await supabase.from("shop_products").update({ [field]: !r[field] } as any).eq("id", r.id);
    setRows((p) => p.map((x) => (x.id === r.id ? { ...x, [field]: !x[field] } : x)));
  };

  const aiFill = async () => {
    if (!editing?.name) return toast.error("আগে প্রোডাক্টের নাম লিখুন");
    setAiBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-ai", {
      body: { task: "product", input: { name: editing.name, type: editing.product_type, category: editing.category, price: editing.price } },
    });
    setAiBusy(false);
    if (error) return toast.error("AI কাজ করেনি");
    const r = data?.result || {};
    setEditing((e: any) => ({
      ...e,
      name_bn: r.name_bn || e.name_bn,
      short_description: r.short_description || e.short_description,
      short_description_bn: r.short_description_bn || e.short_description_bn,
      full_description: r.full_description || e.full_description,
      full_description_bn: r.full_description_bn || e.full_description_bn,
      category: e.category || r.category || "",
      badge: e.badge || r.badge || "",
    }));
    toast.success("AI বর্ণনা বসানো হয়েছে");
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base flex-1">প্রোডাক্ট ({filtered.length})</CardTitle>
            <Button size="sm" onClick={() => setEditing({ ...empty })}><Plus className="h-3.5 w-3.5 mr-1" /> নতুন</Button>
          </div>
          <div className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="pl-8 h-9" placeholder="সার্চ..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব</SelectItem>
                <SelectItem value="digital">ডিজিটাল</SelectItem>
                <SelectItem value="physical">ফিজিক্যাল</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div> : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((r) => (
                <div key={r.id} className="rounded-xl border border-border/60 p-3 bg-card space-y-2">
                  <div className="flex gap-2">
                    <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0 grid place-items-center">
                      {r.image ? <img src={r.image} alt={r.name} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.category || "—"}</p>
                      <p className="text-xs font-bold text-primary">{money(r.discount_price || r.price)}</p>
                    </div>
                    <Badge variant="outline" className="h-fit text-[9px] gap-1">
                      {r.product_type === "digital" ? <><Zap className="h-2.5 w-2.5" />ডিজিটাল</> : <><Package className="h-2.5 w-2.5" />ফিজিক্যাল</>}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <label className="flex items-center gap-1.5"><Switch checked={!!r.is_active} onCheckedChange={() => toggle(r, "is_active")} /> চালু</label>
                    <label className="flex items-center gap-1.5"><Switch checked={!!r.is_featured} onCheckedChange={() => toggle(r, "is_featured")} /> ফিচার্ড</label>
                    {r.product_type === "physical" && <span className={`ml-auto ${Number(r.stock) <= 0 ? "text-red-500" : "text-muted-foreground"}`}>স্টক {r.stock ?? 0}</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setEditing({ ...r })}><Pencil className="h-3 w-3 mr-1" /> এডিট</Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-8">কোন প্রোডাক্ট নেই</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">{editing?.id ? "প্রোডাক্ট এডিট" : "নতুন প্রোডাক্ট"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-2">
                <div><Label className="text-xs">নাম (EN)</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label className="text-xs">নাম (বাংলা)</Label><Input value={editing.name_bn || ""} onChange={(e) => setEditing({ ...editing, name_bn: e.target.value })} /></div>
                <div>
                  <Label className="text-xs">ধরন</Label>
                  <Select value={editing.product_type} onValueChange={(v) => setEditing({ ...editing, product_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="physical">ফিজিক্যাল</SelectItem><SelectItem value="digital">ডিজিটাল</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">ক্যাটাগরি</Label>
                  <Input list="prod-cats" value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                  <datalist id="prod-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <div><Label className="text-xs">দাম</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></div>
                <div><Label className="text-xs">ডিসকাউন্ট দাম</Label><Input type="number" value={editing.discount_price ?? ""} onChange={(e) => setEditing({ ...editing, discount_price: e.target.value })} /></div>
                {editing.product_type === "physical" && <div><Label className="text-xs">স্টক</Label><Input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} /></div>}
                <div><Label className="text-xs">স্লাগ</Label><Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
                <div><Label className="text-xs">ব্যাজ</Label><Input value={editing.badge || ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} /></div>
                <div><Label className="text-xs">ব্যাজ রঙ</Label>
                  <Select value={editing.badge_color || "red"} onValueChange={(v) => setEditing({ ...editing, badge_color: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["red", "green", "blue", "orange", "purple", "pink"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">ছবির লিংক</Label><Input value={editing.image || ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>

              <Button size="sm" variant="outline" onClick={aiFill} disabled={aiBusy} className="w-full">
                {aiBusy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />} AI দিয়ে বর্ণনা লিখুন
              </Button>

              <div className="grid sm:grid-cols-2 gap-2">
                <div><Label className="text-xs">সংক্ষিপ্ত (EN)</Label><Textarea rows={2} value={editing.short_description || ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} /></div>
                <div><Label className="text-xs">সংক্ষিপ্ত (বাংলা)</Label><Textarea rows={2} value={editing.short_description_bn || ""} onChange={(e) => setEditing({ ...editing, short_description_bn: e.target.value })} /></div>
                <div><Label className="text-xs">বিস্তারিত (EN)</Label><Textarea rows={4} value={editing.full_description || ""} onChange={(e) => setEditing({ ...editing, full_description: e.target.value })} /></div>
                <div><Label className="text-xs">বিস্তারিত (বাংলা)</Label><Textarea rows={4} value={editing.full_description_bn || ""} onChange={(e) => setEditing({ ...editing, full_description_bn: e.target.value })} /></div>
              </div>

              {editing.product_type === "digital" && (
                <div><Label className="text-xs">ডেলিভারি নির্দেশনা (ডিজিটাল)</Label>
                  <Textarea rows={2} value={editing.digital_delivery_info || ""} onChange={(e) => setEditing({ ...editing, digital_delivery_info: e.target.value })} /></div>
              )}

              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2"><Switch checked={!!editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> চালু</label>
                <label className="flex items-center gap-2"><Switch checked={!!editing.is_featured} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} /> ফিচার্ড</label>
                <label className="flex items-center gap-2"><Switch checked={!!editing.offer_enabled} onCheckedChange={(v) => setEditing({ ...editing, offer_enabled: v })} /> অফার</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={save} className="flex-1">সেভ করুন</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>বাতিল</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
