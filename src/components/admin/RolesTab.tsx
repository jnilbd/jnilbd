import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { logAudit } from "./shared";

export default function RolesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [uid, setUid] = useState("");

  const load = async () => {
    const [{ data: roles }, { data: profs }] = await Promise.all([
      supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id,full_name,phone"),
    ]);
    setRows(roles || []);
    setProfiles(profs || []);
  };
  useEffect(() => { load(); }, []);

  const nameOf = (id: string) => profiles.find((p) => p.user_id === id)?.full_name || id.slice(0, 8);

  const addAdmin = async () => {
    const id = uid.trim();
    if (!id) return toast.error("ইউজার আইডি দিন");
    const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
    if (error) return toast.error(error.message);
    logAudit("role_grant", "user_roles", id, { role: "admin" });
    toast.success("অ্যাডমিন যোগ হয়েছে"); setUid(""); load();
  };

  const revoke = async (id: string) => {
    if (!confirm("রোল সরাবেন?")) return;
    await supabase.from("user_roles").delete().eq("id", id);
    logAudit("role_revoke", "user_roles", id);
    load();
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> রোল ম্যানেজমেন্ট</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="ইউজার আইডি (UUID) পেস্ট করুন" value={uid} onChange={(e) => setUid(e.target.value)} />
            <Button onClick={addAdmin}><UserPlus className="h-3.5 w-3.5 mr-1" /> অ্যাডমিন করুন</Button>
          </div>
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg border p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{nameOf(r.user_id)}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{r.user_id}</p>
                </div>
                <Badge variant={r.role === "admin" ? "default" : "secondary"} className="text-[10px]">{r.role}</Badge>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => revoke(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-2"><CardTitle className="text-sm">সব ইউজার (আইডি কপি করে অ্যাডমিন বানান)</CardTitle></CardHeader>
        <CardContent className="space-y-1 max-h-72 overflow-y-auto">
          {profiles.map((p) => (
            <button key={p.user_id} onClick={() => { setUid(p.user_id); navigator.clipboard?.writeText(p.user_id); toast.success("আইডি বসানো হয়েছে"); }}
              className="w-full text-left flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-muted">
              <span className="text-sm flex-1 truncate">{p.full_name || "—"}</span>
              <span className="text-[10px] text-muted-foreground">{p.phone || ""}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
