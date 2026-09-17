import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { statusColor, statusBn, logAudit } from "./shared";

type Kind = "tickets" | "product-requests";

const CONF = {
  tickets: {
    table: "support_tickets" as const,
    title: "সাপোর্ট টিকিট",
    statuses: ["open", "answered", "closed"],
    head: (r: any) => r.subject,
    sub: (r: any) => r.message,
  },
  "product-requests": {
    table: "product_requests" as const,
    title: "প্রোডাক্ট রিকোয়েস্ট",
    statuses: ["new", "in_progress", "completed", "cancelled"],
    head: (r: any) => r.product_name,
    sub: (r: any) => r.details,
  },
};

export default function InboxTab({ kind }: { kind: Kind }) {
  const conf = CONF[kind];
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(conf.table).select("*").order("created_at", { ascending: false }).limit(300);
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [kind]);

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from(conf.table).update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    logAudit("inbox_update", conf.table, id, patch);
    toast.success("আপডেট হয়েছে");
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    await supabase.from(conf.table).delete().eq("id", id);
    setRows((p) => p.filter((r) => r.id !== id));
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3"><CardTitle className="text-base">{conf.title} ({rows.length})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {loading ? <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div> : rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-border/60 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{conf.head(r)}</p>
                <p className="text-[11px] text-muted-foreground">{r.name} • {r.phone || "—"} • {new Date(r.created_at).toLocaleString("bn-BD")}</p>
              </div>
              <Badge className={`${statusColor(r.status)} text-white text-[10px]`}>{statusBn(r.status)}</Badge>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
            </div>
            {conf.sub(r) && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{conf.sub(r)}</p>}
            <div className="flex flex-wrap gap-1.5">
              {conf.statuses.map((s) => (
                <button key={s} onClick={() => update(r.id, { status: s })}
                  className={`px-2.5 py-1 rounded-full text-[11px] border ${r.status === s ? `${statusColor(s)} text-white border-transparent` : "hover:bg-muted"}`}>
                  {statusBn(s)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea rows={1} placeholder={kind === "tickets" ? "উত্তর লিখুন..." : "নোট লিখুন..."}
                value={reply[r.id] ?? (kind === "tickets" ? r.admin_reply || "" : r.admin_note || "")}
                onChange={(e) => setReply({ ...reply, [r.id]: e.target.value })} className="text-xs" />
              <Button size="sm" variant="outline" onClick={() => update(r.id, kind === "tickets"
                ? { admin_reply: reply[r.id] ?? r.admin_reply, status: "answered" }
                : { admin_note: reply[r.id] ?? r.admin_note })}>সেভ</Button>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">কিছু নেই</p>}
      </CardContent>
    </Card>
  );
}
