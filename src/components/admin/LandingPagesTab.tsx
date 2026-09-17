import { useEffect, useState } from "react";
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
import {
  ArrowDown, ArrowUp, ExternalLink, Eye, Loader2, Plus, RefreshCw, Trash2, Copy,
} from "lucide-react";
import { logAudit } from "./shared";
import { BlockView } from "@/pages/LandingPage";

const BLOCK_TYPES: { type: string; label: string; fields: string[] }[] = [
  { type: "hero", label: "হিরো (বড় হেডার)", fields: ["title", "subtitle", "image", "ctaText", "ctaLink"] },
  { type: "text", label: "লেখা", fields: ["title", "body"] },
  { type: "features", label: "সুবিধার তালিকা", fields: ["title", "body"] },
  { type: "image", label: "ছবি", fields: ["image", "title"] },
  { type: "video", label: "ভিডিও (embed লিংক)", fields: ["url", "title"] },
  { type: "faq", label: "প্রশ্ন-উত্তর", fields: ["title", "body"] },
  { type: "cta", label: "অর্ডার বাটন (CTA)", fields: ["title", "subtitle", "ctaText", "ctaLink"] },
];

const FIELD_LABEL: Record<string, string> = {
  title: "শিরোনাম", subtitle: "উপ-শিরোনাম", body: "লেখা", image: "ছবির লিংক",
  url: "ভিডিও embed লিংক", ctaText: "বাটনের লেখা", ctaLink: "বাটনের লিংক",
};

const HINT: Record<string, string> = {
  features: "প্রতি লাইনে একটি সুবিধা লিখুন",
  faq: "প্রতি লাইনে: প্রশ্ন | উত্তর",
};

const uid = () => Math.random().toString(36).slice(2, 9);

export default function LandingPagesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("landing_pages").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const slug = `page-${Date.now().toString(36)}`;
    const { data, error } = await supabase.from("landing_pages").insert({
      slug, title: "নতুন ল্যান্ডিং পেজ",
      blocks: [
        { id: uid(), type: "hero", title: "আপনার অফারের শিরোনাম", subtitle: "ছোট বর্ণনা", ctaText: "এখনই অর্ডার করুন", ctaLink: "/shop" },
        { id: uid(), type: "features", title: "কেন নেবেন", body: "দ্রুত ডেলিভারি\n১০০% অরিজিনাল\nক্যাশ অন ডেলিভারি" },
        { id: uid(), type: "cta", title: "আজই অর্ডার করুন", ctaText: "অর্ডার করুন", ctaLink: "/shop" },
      ],
    }).select().maybeSingle();
    if (error) return toast.error(error.message);
    logAudit("landing_create", "landing_pages", data?.id);
    setRows((p) => [data, ...p]);
    setActive(data);
  };

  const remove = async (id: string) => {
    if (!confirm("পেজটি ডিলিট করবেন?")) return;
    await supabase.from("landing_pages").delete().eq("id", id);
    logAudit("landing_delete", "landing_pages", id);
    setRows((p) => p.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base flex-1">ল্যান্ডিং পেজ বিল্ডার <span className="text-xs font-normal text-muted-foreground">({rows.length})</span></CardTitle>
            <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-3.5 w-3.5 mr-1" /> রিফ্রেশ</Button>
            <Button size="sm" onClick={create}><Plus className="h-3.5 w-3.5 mr-1" /> নতুন পেজ</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">এখনো কোন ল্যান্ডিং পেজ নেই</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {rows.map((r) => (
                <div key={r.id} className="rounded-xl border border-border/60 bg-card p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">/p/{r.slug} • {(Array.isArray(r.blocks) ? r.blocks.length : 0)} ব্লক • {r.views || 0} ভিউ</p>
                    </div>
                    <Badge variant={r.is_published ? "default" : "outline"} className="text-[10px]">{r.is_published ? "প্রকাশিত" : "ড্রাফট"}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Button size="sm" variant="outline" onClick={() => setActive(r)}>এডিট</Button>
                    <Button size="sm" variant="ghost" asChild><a href={`/p/${r.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>
                    <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/${r.slug}`); toast.success("লিংক কপি হয়েছে"); }}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500 ml-auto" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PageEditor page={active} onClose={() => setActive(null)} onSaved={(p: any) => { setRows((r) => r.map((x) => (x.id === p.id ? p : x))); setActive(p); }} />
    </div>
  );
}

function PageEditor({ page, onClose, onSaved }: any) {
  const [form, setForm] = useState<any>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (page) setForm({ ...page, blocks: Array.isArray(page.blocks) ? page.blocks : [] });
  }, [page?.id]);

  if (!page || !form) return null;

  const setBlock = (id: string, patch: any) =>
    setForm((f: any) => ({ ...f, blocks: f.blocks.map((b: any) => (b.id === id ? { ...b, ...patch } : b)) }));

  const addBlock = (type: string) =>
    setForm((f: any) => ({ ...f, blocks: [...f.blocks, { id: uid(), type, title: "" }] }));

  const moveBlock = (i: number, dir: -1 | 1) =>
    setForm((f: any) => {
      const b = [...f.blocks];
      const j = i + dir;
      if (j < 0 || j >= b.length) return f;
      [b[i], b[j]] = [b[j], b[i]];
      return { ...f, blocks: b };
    });

  const save = async () => {
    setSaving(true);
    const payload = {
      slug: String(form.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      title: form.title, seo_title: form.seo_title, seo_description: form.seo_description,
      is_published: !!form.is_published, blocks: form.blocks,
    };
    const { data, error } = await supabase.from("landing_pages").update(payload).eq("id", form.id).select().maybeSingle();
    setSaving(false);
    if (error) return toast.error(error.message);
    logAudit("landing_update", "landing_pages", form.id, { slug: payload.slug });
    toast.success("সেভ হয়েছে");
    onSaved(data);
  };

  return (
    <Dialog open={!!page} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-base">পেজ এডিটর</DialogTitle></DialogHeader>

        <div className="grid sm:grid-cols-2 gap-2">
          <div><Label className="text-xs">শিরোনাম</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label className="text-xs">ঠিকানা (/p/slug)</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><Label className="text-xs">SEO শিরোনাম</Label><Input value={form.seo_title || ""} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></div>
          <div><Label className="text-xs">SEO বর্ণনা</Label><Input value={form.seo_description || ""} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></div>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={!!form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
          <span className="text-xs">প্রকাশ করুন (সবাই দেখতে পাবে)</span>
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => setPreview((p) => !p)}>
            <Eye className="h-3.5 w-3.5 mr-1" /> {preview ? "এডিট" : "প্রিভিউ"}
          </Button>
        </div>

        {preview ? (
          <div className="rounded-xl border border-border/60 overflow-hidden">
            {form.blocks.map((b: any) => <BlockView key={b.id} block={b} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {form.blocks.map((b: any, i: number) => {
              const def = BLOCK_TYPES.find((t) => t.type === b.type);
              return (
                <div key={b.id} className="rounded-xl border border-border/60 p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{def?.label || b.type}</Badge>
                    <div className="ml-auto flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => moveBlock(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => moveBlock(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setForm({ ...form, blocks: form.blocks.filter((x: any) => x.id !== b.id) })}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {(def?.fields || []).map((f) =>
                    f === "body" ? (
                      <div key={f}>
                        <Label className="text-xs">{FIELD_LABEL[f]} {HINT[b.type] && <span className="text-muted-foreground">— {HINT[b.type]}</span>}</Label>
                        <Textarea rows={4} value={b[f] || ""} onChange={(e) => setBlock(b.id, { [f]: e.target.value })} />
                      </div>
                    ) : (
                      <div key={f}>
                        <Label className="text-xs">{FIELD_LABEL[f]}</Label>
                        <Input value={b[f] || ""} onChange={(e) => setBlock(b.id, { [f]: e.target.value })} />
                      </div>
                    ),
                  )}
                </div>
              );
            })}

            <div className="flex items-center gap-2 pt-1">
              <Select onValueChange={addBlock}>
                <SelectTrigger className="h-9 w-56"><SelectValue placeholder="+ ব্লক যোগ করুন" /></SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((t) => <SelectItem key={t.type} value={t.type}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={save} disabled={saving}>{saving ? "সেভ হচ্ছে..." : "সেভ করুন"}</Button>
          <Button size="sm" variant="outline" asChild><a href={`/p/${form.slug}`} target="_blank" rel="noreferrer">লাইভ দেখুন</a></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
