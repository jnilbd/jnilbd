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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { logAudit } from "./shared";

/* ---------------- Homepage blocks ---------------- */
const emptyBlock = { block_type: "banner", title: "", title_bn: "", subtitle: "", subtitle_bn: "", image: "", link: "", sort_order: 0, is_active: true };

export function HomepageBlocksTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("homepage_blocks").select("*").order("sort_order");
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const p: any = { ...editing };
    p.sort_order = Number(p.sort_order || 0);
    delete p.created_at; delete p.updated_at;
    const res = p.id ? await supabase.from("homepage_blocks").update(p).eq("id", p.id) : await supabase.from("homepage_blocks").insert((() => { delete p.id; return p; })());
    if (res.error) return toast.error(res.error.message);
    logAudit("block_save", "homepage_blocks", p.id, { title: p.title });
    toast.success("সেভ হয়েছে"); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from("homepage_blocks").delete().eq("id", id); load();
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">হোমপেজ ব্লক ও ব্যানার ({rows.length})</CardTitle>
          <Button size="sm" onClick={() => setEditing({ ...emptyBlock })}><Plus className="h-3.5 w-3.5 mr-1" /> নতুন</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((b) => (
            <div key={b.id} className="flex items-center gap-2 rounded-xl border p-2.5">
              {b.image && <img src={b.image} alt="" className="h-10 w-16 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{b.title_bn || b.title || "—"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{b.block_type} • ক্রম {b.sort_order}</p>
              </div>
              <Badge variant={b.is_active ? "default" : "secondary"} className="text-[10px]">{b.is_active ? "চালু" : "বন্ধ"}</Badge>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing({ ...b })}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(b.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">কোনো ব্লক নেই</p>}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">হোমপেজ ব্লক</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">ধরন</Label><Input value={editing.block_type} onChange={(e) => setEditing({ ...editing, block_type: e.target.value })} placeholder="banner / hero / popup / strip" /></div>
                <div><Label className="text-xs">ক্রম</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
                <div><Label className="text-xs">টাইটেল (EN)</Label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                <div><Label className="text-xs">টাইটেল (বাংলা)</Label><Input value={editing.title_bn || ""} onChange={(e) => setEditing({ ...editing, title_bn: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs">সাবটাইটেল (বাংলা)</Label><Textarea rows={2} value={editing.subtitle_bn || ""} onChange={(e) => setEditing({ ...editing, subtitle_bn: e.target.value })} /></div>
              <div><Label className="text-xs">ছবির লিংক</Label><Input value={editing.image || ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>
              <div><Label className="text-xs">বাটন লিংক</Label><Input value={editing.link || ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-xs"><Switch checked={!!editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> চালু</label>
              <Button onClick={save} className="w-full">সেভ করুন</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Blog ---------------- */
const emptyPost = { title: "", title_bn: "", slug: "", excerpt_bn: "", content_bn: "", cover_image: "", category: "", author: "John Nil", is_published: false };

export function BlogTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const p: any = { ...editing };
    if (!p.title) return toast.error("টাইটেল দিন");
    if (!p.slug) p.slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || String(Date.now());
    if (p.is_published && !p.published_at) p.published_at = new Date().toISOString();
    delete p.created_at; delete p.updated_at;
    const res = p.id ? await supabase.from("blog_posts").update(p).eq("id", p.id) : await supabase.from("blog_posts").insert((() => { delete p.id; return p; })());
    if (res.error) return toast.error(res.error.message);
    logAudit("blog_save", "blog_posts", p.id, { title: p.title });
    toast.success("সেভ হয়েছে"); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from("blog_posts").delete().eq("id", id); load();
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">ব্লগ পোস্ট ({rows.length})</CardTitle>
          <Button size="sm" onClick={() => setEditing({ ...emptyPost })}><Plus className="h-3.5 w-3.5 mr-1" /> নতুন পোস্ট</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? <div className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div> : rows.map((b) => (
            <div key={b.id} className="flex items-center gap-2 rounded-xl border p-2.5">
              {b.cover_image && <img src={b.cover_image} alt="" className="h-10 w-16 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{b.title_bn || b.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{b.category || "—"} • {new Date(b.created_at).toLocaleDateString("bn-BD")}</p>
              </div>
              <Badge variant={b.is_published ? "default" : "secondary"} className="text-[10px]">{b.is_published ? "প্রকাশিত" : "খসড়া"}</Badge>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing({ ...b })}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(b.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
            </div>
          ))}
          {!loading && rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">কোনো পোস্ট নেই</p>}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">ব্লগ পোস্ট</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-2">
              <div className="grid sm:grid-cols-2 gap-2">
                <div><Label className="text-xs">টাইটেল (EN)</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                <div><Label className="text-xs">টাইটেল (বাংলা)</Label><Input value={editing.title_bn || ""} onChange={(e) => setEditing({ ...editing, title_bn: e.target.value })} /></div>
                <div><Label className="text-xs">ক্যাটাগরি</Label><Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
                <div><Label className="text-xs">স্লাগ</Label><Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs">কভার ছবি</Label><Input value={editing.cover_image || ""} onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })} /></div>
              <div><Label className="text-xs">সারাংশ</Label><Textarea rows={2} value={editing.excerpt_bn || ""} onChange={(e) => setEditing({ ...editing, excerpt_bn: e.target.value })} /></div>
              <div><Label className="text-xs">কনটেন্ট</Label><Textarea rows={10} value={editing.content_bn || ""} onChange={(e) => setEditing({ ...editing, content_bn: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-xs"><Switch checked={!!editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} /> প্রকাশ করুন</label>
              <Button onClick={save} className="w-full">সেভ করুন</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
