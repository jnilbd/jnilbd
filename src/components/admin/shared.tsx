import { supabase } from "@/integrations/supabase/client";

export const money = (n: any) => `৳${Number(n || 0).toLocaleString("en-BD")}`;

export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

export const statusColor = (s?: string) =>
  ({
    pending: "bg-amber-500",
    confirmed: "bg-cyan-600",
    processing: "bg-blue-500",
    shipped: "bg-purple-500",
    delivered: "bg-emerald-600",
    completed: "bg-emerald-600",
    in_progress: "bg-blue-500",
    open: "bg-amber-500",
    new: "bg-amber-500",
    answered: "bg-blue-500",
    closed: "bg-gray-500",
    cancelled: "bg-red-500",
    refunded: "bg-gray-500",
  }[s || ""] || "bg-gray-400");

export const statusBn = (s?: string) =>
  ({
    pending: "পেন্ডিং",
    confirmed: "কনফার্ম",
    processing: "প্রসেসিং",
    shipped: "শিপড",
    delivered: "ডেলিভারড",
    cancelled: "বাতিল",
    refunded: "রিফান্ড",
    completed: "সম্পন্ন",
    in_progress: "চলমান",
    open: "খোলা",
    answered: "উত্তর দেওয়া",
    closed: "বন্ধ",
    new: "নতুন",
  }[s || ""] || s || "—");

export async function logAudit(action: string, entity: string, entityId?: string, details: any = {}) {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: data.user.id,
      actor_email: data.user.email,
      action,
      entity,
      entity_id: entityId ?? null,
      details,
    });
  } catch {
    /* audit is best-effort */
  }
}

export function toCsv(rows: any[], columns?: string[]) {
  if (!rows.length) return "";
  const cols = columns || Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function downloadCsv(filename: string, rows: any[], columns?: string[]) {
  const blob = new Blob(["\uFEFF" + toCsv(rows, columns)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
