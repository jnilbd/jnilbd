import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Ticket } from "lucide-react";
import { logAudit } from "./shared";

const empty = {
  code: "", description: "", discount_type: "percent", discount_value: 10,
  min_order: 0, max_uses: null as any, applies_to: "all", expires_at: "", is_active: true,
};

export default function CouponsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const p: any = { ...editing };
    if (!p.code) return toast.error("কোড দিন");
    p.code = p.code.toUpperCase().trim();
    p.discount_value = Number(p.discount_value || 0);
    p.min_order = Number(p.min_order || 0);
    p.max_uses = p.max_uses ? Number(p.max_uses) : null;
    p.expires_at = p.expires_at ? new Date(p.expires_at).toISOString() : null;
    delete p.created_at; delete p.updated_at; delete p.used_count;
    const res = p.id ? await supabase.from("coupons").update(p).eq("id", p.id) : await supabase.from("coupons").insert((() => { delete p.id; return p; })());
    if (res.error) return toast.error(res.error.message);
    logAudit(p.id ? "coupon_update" : "coupon_create", "coupons", p.id, { code: p.code });
    toast.success("সেভ হয়েছে"); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    logAudit("coupon_delete", "coupons", id); load();
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">কুপন ({rows.length})</CardTitle>
          <Button size="sm" onClick={() => setEditing({ ...empty })}><Plus className="h-3.5 w-3.5 mr-1" /> নতুন কুপন</Button>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {rows.map((c) => {
            const expired = c.expires_at && new Date(c.expires_at) < new Date();
            return (
              <div key={c.id} className="rounded-xl border border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-transparent p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span className="font-mono font-bold tracking-wider">{c.code}</span>
                  <Badge variant={c.is_active && !expired ? "default" : "secondary"} className="ml-auto text-[10px]">
                    {expired ? "মেয়াদ শেষ" : c.is_active ? "চালু" : "বন্ধ"}
                  </Badge>
                </div>
                <p className="text-sm font-semibold">
                  {c.discount_type === "percent" ? `${c.discount_value}% ছাড়` : `৳${c.discount_value} ছাড়`}
                  {c.min_order > 0 && <span className="text-[11px] font-normal text-muted-foreground"> • ন্যূনতম ৳{c.min_order}</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  ব্যবহার {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""} • {c.applies_to === "all" ? "সব পণ্যে" : c.applies_to}
                  {c.expires_at && ` • ${new Date(c.expires_at).toLocaleDateString("bn-BD")}`}
                </p>
                <div className="flex gap-1.5 pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setEditing({ ...c, expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "" })}><Pencil className="h-3 w-3 mr-1" /> এডিট</Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-8">কোনো কুপন নেই</p>}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-base">কুপন</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-2">
              <div><Label className="text-xs">কোড</Label><Input className="font-mono uppercase" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></div>
              <div><Label className="text-xs">বর্ণনা</Label><Input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">ধরন</Label>
                  <Select value={editing.discount_type} onValueChange={(v) => setEditing({ ...editing, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="percent">শতাংশ (%)</SelectItem><SelectItem value="fixed">নির্দিষ্ট (৳)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">মান</Label><Input type="number" value={editing.discount_value} onChange={(e) => setEditing({ ...editing, discount_value: e.target.value })} /></div>
                <div><Label className="text-xs">ন্যূনতম অর্ডার</Label><Input type="number" value={editing.min_order} onChange={(e) => setEditing({ ...editing, min_order: e.target.value })} /></div>
                <div><Label className="text-xs">সর্বোচ্চ ব্যবহার</Label><Input type="number" value={editing.max_uses ?? ""} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value })} /></div>
                <div><Label className="text-xs">প্রযোজ্য</Label>
                  <Select value={editing.applies_to} onValueChange={(v) => setEditing({ ...editing, applies_to: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">সব</SelectItem><SelectItem value="digital">ডিজিটাল</SelectItem><SelectItem value="physical">ফিজিক্যাল</SelectItem><SelectItem value="service">সার্ভিস</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">মেয়াদ শেষ</Label><Input type="date" value={editing.expires_at || ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-xs pt-1"><Switch checked={!!editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> চালু</label>
              <Button onClick={save} className="w-full">সেভ করুন</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
