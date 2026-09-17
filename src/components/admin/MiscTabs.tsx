import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ExternalLink, Loader2, Star, Trash2 } from "lucide-react";
import { statusBn, statusColor, money } from "./shared";

const REQ_STATUSES = ["pending", "in_progress", "completed", "cancelled"];

export function ServiceOrdersTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("service_orders").select("*").order("created_at", { ascending: false }).limit(300);
    setRows(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: string) => {
    await supabase.from("service_orders").update({ status }).eq("id", id);
    toast.success("আপডেট হয়েছে"); load();
  };
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3"><CardTitle className="text-base">সার্ভিস অর্ডার ({rows.length})</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto my-8" /> : (
          <Table>
            <TableHeader><TableRow><TableHead>তারিখ</TableHead><TableHead>কাস্টমার</TableHead><TableHead>সার্ভিস</TableHead><TableHead>কোট</TableHead><TableHead>স্ট্যাটাস</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
                  <TableCell className="text-xs"><div className="font-medium">{r.customer_name}</div><div className="text-muted-foreground">{r.customer_phone}</div></TableCell>
                  <TableCell className="text-xs">{r.service_name}</TableCell>
                  <TableCell className="text-xs">{money(r.quoted_amount)}</TableCell>
                  <TableCell>
                    <Select value={r.status || "pending"} onValueChange={(v) => update(r.id, v)}>
                      <SelectTrigger className="h-8 w-32"><Badge className={`${statusColor(r.status)} text-white text-[10px]`}>{statusBn(r.status)}</Badge></SelectTrigger>
                      <SelectContent>{REQ_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusBn(s)}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">কোন অর্ডার নেই</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function ServiceRequestsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false }).limit(300);
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: string) => {
    await supabase.from("service_requests").update({ status }).eq("id", id);
    toast.success("আপডেট হয়েছে"); load();
  };
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3"><CardTitle className="text-base">সার্ভিস রিকোয়েস্ট ({rows.length})</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>তারিখ</TableHead><TableHead>নাম</TableHead><TableHead>সার্ভিস</TableHead><TableHead>বাজেট</TableHead><TableHead>স্ট্যাটাস</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell className="text-xs"><div className="font-medium">{r.name}</div><div className="text-muted-foreground">{r.phone}</div></TableCell>
                <TableCell className="text-xs">{r.service_type}{r.urgent && <Badge variant="destructive" className="ml-1 text-[10px]">জরুরি</Badge>}</TableCell>
                <TableCell className="text-xs">{r.budget}</TableCell>
                <TableCell>
                  <Select value={r.status || "pending"} onValueChange={(v) => update(r.id, v)}>
                    <SelectTrigger className="h-8 w-32"><Badge className={`${statusColor(r.status)} text-white text-[10px]`}>{statusBn(r.status)}</Badge></SelectTrigger>
                    <SelectContent>{REQ_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusBn(s)}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">কিছু নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ReviewsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("product_reviews").select("*").order("created_at", { ascending: false }).limit(300);
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const toggle = async (id: string, v: boolean) => { await supabase.from("product_reviews").update({ is_approved: !v }).eq("id", id); load(); };
  const remove = async (id: string) => { if (!confirm("ডিলিট করবেন?")) return; await supabase.from("product_reviews").delete().eq("id", id); load(); };
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3"><CardTitle className="text-base">রিভিউ ({rows.length})</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border p-3 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium">{r.reviewer_name || "Anonymous"}</span>
                <span className="flex items-center gap-0.5 text-amber-500">{Array.from({ length: r.rating || 0 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</span>
                <Badge variant={r.is_approved ? "default" : "secondary"} className="text-[10px]">{r.is_approved ? "অনুমোদিত" : "অপেক্ষমাণ"}</Badge>
              </div>
              {r.comment && <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>}
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggle(r.id, !!r.is_approved)}>{r.is_approved ? "লুকান" : "অনুমোদন"}</Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">কোনো রিভিউ নেই</p>}
      </CardContent>
    </Card>
  );
}

export function SimpleEntityTab({ table, label, editPath }: { table: any; label: string; editPath?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false }).limit(300);
    setRows(data || []);
  };
  useEffect(() => { load(); }, [table]);
  const remove = async (id: string) => { if (!confirm("ডিলিট করবেন?")) return; await supabase.from(table).delete().eq("id", id); load(); };
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{label} ({rows.length})</CardTitle>
        {editPath && <Button asChild size="sm" variant="outline"><Link to={editPath}><ExternalLink className="h-3 w-3 mr-1" /> পেজ দেখুন</Link></Button>}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>নাম/টাইটেল</TableHead><TableHead>মূল্য</TableHead><TableHead>তৈরি</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm font-medium">{r.name || r.title || "—"}</TableCell>
                <TableCell className="text-xs">{money(r.price ?? r.starting_price ?? 0)}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("bn-BD")}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">কিছু নেই</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
