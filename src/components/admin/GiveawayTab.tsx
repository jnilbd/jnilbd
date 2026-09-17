import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Gift, Loader2, Plus, Shuffle, Trash2, Users } from "lucide-react";
import { logAudit, downloadCsv } from "./shared";

const empty = { title: "", title_bn: "", description: "", prize: "", image: "", rules: "", ends_at: "", max_entries: "", is_active: true };

export default function GiveawayTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [entries, setEntries] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("giveaways").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    const { data: e } = await supabase.from("giveaway_entries").select("*").order("created_at", { ascending: false }).limit(2000);
    const map: Record<string, any[]> = {};
    (e || []).forEach((r: any) => { (map[r.giveaway_id] ||= []).push(r); });
    setEntries(map); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return toast.error("টাইটেল লিখুন");
    setSaving(true);
    const payload: any = {
      title: form.title, title_bn: form.title_bn || null, description: form.description || null, prize: form.prize || null,
      image: form.image || null, rules: form.rules || null, is_active: form.is_active,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      max_entries: form.max_entries ? Number(form.max_entries) : null,
    };
    const res = form.id
      ? await supabase.from("giveaways").update(payload).eq("id", form.id)
      : await supabase.from("giveaways").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    logAudit(form.id ? "giveaway_update" : "giveaway_create", "giveaways", form.id, payload);
    toast.success("সেভ হয়েছে"); setOpen(false); load();
  };

  const pickWinner = async (g: any) => {
    const list = entries[g.id] || [];
    if (list.length === 0) return toast.error("কোনো অংশগ্রহণকারী নেই");
    const win = list[Math.floor(Math.random() * list.length)];
    await supabase.from("giveaway_entries").update({ is_winner: false }).eq("giveaway_id", g.id);
    await supabase.from("giveaway_entries").update({ is_winner: true }).eq("id", win.id);
    await supabase.from("giveaways").update({ winner_entry_id: win.id }).eq("id", g.id);
    logAudit("giveaway_winner", "giveaways", g.id, { winner: win.phone });
    toast.success(`বিজয়ী: ${win.name} (${win.phone})`); load();
  };

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from("giveaways").delete().eq("id", id); load();
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground flex-1">ফ্রি ড্রপ ও গিভঅ্যাওয়ে — গ্রাহক <code>/giveaway</code> পেজে অংশ নেবে।</p>
        <Button size="sm" onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-3.5 w-3.5 mr-1" /> নতুন</Button>
      </div>

      {rows.map((g) => {
        const list = entries[g.id] || [];
        const winner = list.find((e) => e.is_winner);
        return (
          <Card key={g.id} className="border-border/60">
            <CardHeader className="pb-2 flex-row items-start gap-2 space-y-0">
              <Gift className="h-5 w-5 text-primary mt-0.5" />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base truncate">{g.title_bn || g.title}</CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  পুরস্কার: {g.prize || "—"} • শেষ: {g.ends_at ? new Date(g.ends_at).toLocaleDateString("bn-BD") : "সীমা নেই"}
                </p>
              </div>
              <Badge className={g.is_active ? "bg-emerald-600 text-white" : "bg-gray-400 text-white"}>{g.is_active ? "চালু" : "বন্ধ"}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs"><Users className="h-3.5 w-3.5" /> {list.length} জন অংশ নিয়েছে</span>
                {winner && <Badge variant="secondary" className="text-[10px]">বিজয়ী: {winner.name} • {winner.phone}</Badge>}
                <div className="flex-1" />
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>তালিকা</Button>
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => downloadCsv(`giveaway-${g.id}.csv`, list)}>CSV</Button>
                <Button size="sm" className="h-7 text-[11px]" onClick={() => pickWinner(g)}><Shuffle className="h-3 w-3 mr-1" /> বিজয়ী নির্বাচন</Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { setForm({ ...g, ends_at: g.ends_at ? String(g.ends_at).slice(0, 10) : "", max_entries: g.max_entries || "" }); setOpen(true); }}>এডিট</Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(g.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
              </div>
              {expanded === g.id && (
                <div className="max-h-60 overflow-y-auto space-y-1 rounded-xl border p-2">
                  {list.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 truncate">{e.name}</span>
                      <span className="text-muted-foreground">{e.phone}</span>
                      {e.is_winner && <Badge className="bg-amber-500 text-white text-[9px]">বিজয়ী</Badge>}
                    </div>
                  ))}
                  {list.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">কেউ অংশ নেয়নি</p>}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">কোনো গিভঅ্যাওয়ে নেই</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "গিভঅ্যাওয়ে এডিট" : "নতুন গিভঅ্যাওয়ে"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">টাইটেল (English)</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label className="text-xs">টাইটেল (বাংলা)</Label><Input value={form.title_bn || ""} onChange={(e) => setForm({ ...form, title_bn: e.target.value })} /></div>
            <div><Label className="text-xs">পুরস্কার</Label><Input value={form.prize || ""} onChange={(e) => setForm({ ...form, prize: e.target.value })} /></div>
            <div><Label className="text-xs">বর্ণনা</Label><Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label className="text-xs">নিয়মকানুন</Label><Textarea rows={2} value={form.rules || ""} onChange={(e) => setForm({ ...form, rules: e.target.value })} /></div>
            <div><Label className="text-xs">ছবির লিংক</Label><Input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">শেষ তারিখ</Label><Input type="date" value={form.ends_at || ""} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
              <div><Label className="text-xs">সর্বোচ্চ অংশগ্রহণ</Label><Input type="number" value={form.max_entries || ""} onChange={(e) => setForm({ ...form, max_entries: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={!!form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label className="text-xs">চালু</Label></div>
            <Button className="w-full" onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} সেভ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
