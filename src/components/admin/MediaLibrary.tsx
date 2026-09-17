import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Loader2, Trash2, Upload, ImageIcon } from "lucide-react";

const BUCKETS = ["marketplace-images", "rental-images"];

export default function MediaLibrary() {
  const [bucket, setBucket] = useState(BUCKETS[0]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(bucket).list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) toast.error(error.message);
    setFiles((data || []).filter((f) => f.id));
    setLoading(false);
  };
  useEffect(() => { load(); }, [bucket]);

  const urlOf = (name: string) => supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl;

  const upload = async (fl: FileList | null) => {
    if (!fl?.length) return;
    setBusy(true);
    for (const f of Array.from(fl)) {
      const path = `${Date.now()}-${f.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from(bucket).upload(path, f);
      if (error) toast.error(error.message);
    }
    setBusy(false);
    toast.success("আপলোড হয়েছে");
    load();
  };

  const remove = async (name: string) => {
    if (!confirm("ফাইলটি মুছবেন?")) return;
    await supabase.storage.from(bucket).remove([name]);
    load();
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base flex-1 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> মিডিয়া লাইব্রেরি</CardTitle>
          <Select value={bucket} onValueChange={setBucket}>
            <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{BUCKETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />} আপলোড
          </Button>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div> : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {files.map((f) => (
              <div key={f.name} className="group relative rounded-lg overflow-hidden border bg-muted aspect-square">
                <img src={urlOf(f.name)} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => { navigator.clipboard?.writeText(urlOf(f.name)); toast.success("লিংক কপি হয়েছে"); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => remove(f.name)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
            {files.length === 0 && <p className="col-span-full text-center text-sm text-muted-foreground py-8">কোনো ছবি নেই</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
