import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const db = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

type Cfg = Record<string, any>;

function need(cfg: Cfg, keys: string[], provider: string) {
  const missing = keys.filter((k) => !String(cfg?.[k] ?? "").trim());
  if (missing.length) throw new Error(`${provider}: সেটিংসে এই তথ্যগুলো নেই — ${missing.join(", ")}`);
}

async function jfetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch { /* keep text */ }
  if (!res.ok) throw new Error(typeof body === "string" ? body.slice(0, 300) : JSON.stringify(body).slice(0, 300));
  return body;
}

async function bkashPay(c: Cfg, i: Cfg) {
  need(c, ["username", "password", "app_key", "app_secret"], "bKash");
  const base = c.sandbox ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" : "https://tokenized.pay.bka.sh/v1.2.0-beta";
  const tok = await jfetch(`${base}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", username: c.username, password: c.password },
    body: JSON.stringify({ app_key: c.app_key, app_secret: c.app_secret }),
  });
  if (!tok?.id_token) throw new Error(tok?.statusMessage || "bKash টোকেন পাওয়া যায়নি");
  const r = await jfetch(`${base}/tokenized/checkout/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: tok.id_token, "X-App-Key": c.app_key },
    body: JSON.stringify({
      mode: "0011", payerReference: i.phone || "01", callbackURL: c.callback_url || i.callback,
      amount: String(i.amount), currency: "BDT", intent: "sale", merchantInvoiceNumber: i.invoice,
    }),
  });
  if (!r?.bkashURL) throw new Error(r?.statusMessage || "পেমেন্ট লিংক তৈরি হয়নি");
  return { url: r.bkashURL as string };
}

async function sslPay(c: Cfg, i: Cfg) {
  need(c, ["store_id", "store_passwd"], "SSLCommerz");
  const host = c.sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
  const form = new URLSearchParams({
    store_id: c.store_id, store_passwd: c.store_passwd, total_amount: String(i.amount),
    currency: "BDT", tran_id: i.invoice,
    success_url: c.success_url || i.callback || "", fail_url: c.fail_url || i.callback || "",
    cancel_url: c.cancel_url || i.callback || "",
    cus_name: i.name || "Customer", cus_email: i.email || "n@a.com", cus_phone: i.phone || "01700000000",
    cus_add1: i.address || "Dhaka", cus_city: "Dhaka", cus_country: "Bangladesh",
    shipping_method: "NO", product_name: i.product || "Order", product_category: "general", product_profile: "general",
  });
  const r = await jfetch(`${host}/gwprocess/v4/api.php`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form,
  });
  if (r?.status !== "SUCCESS" || !r?.GatewayPageURL) throw new Error(r?.failedreason || "পেমেন্ট সেশন তৈরি হয়নি");
  return { url: r.GatewayPageURL as string };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = db();
  let provider = "";
  try {
    const body = await req.json().catch(() => ({}));
    provider = String(body?.provider || "");
    if (!["bkash", "sslcommerz"].includes(provider)) return json({ error: "অজানা পেমেন্ট সার্ভিস" }, 400);

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) return json({ error: "টাকার অঙ্ক সঠিক নয়" }, 400);

    const input = {
      amount: Math.round(amount),
      invoice: String(body?.invoice || `JN-${Date.now()}`).slice(0, 40),
      name: String(body?.name || "").slice(0, 80),
      phone: String(body?.phone || "").slice(0, 20),
      email: String(body?.email || "").slice(0, 120),
      address: String(body?.address || "").slice(0, 200),
      product: String(body?.product || "Order").slice(0, 120),
      callback: String(body?.callback || "").slice(0, 300),
    };

    const { data: row } = await sb.from("integration_settings").select("*").eq("provider", provider).maybeSingle();
    if (!row || !row.enabled) return json({ error: "অনলাইন পেমেন্ট এখন চালু নেই" }, 400);

    const result = provider === "bkash" ? await bkashPay(row.config || {}, input) : await sslPay(row.config || {}, input);

    await sb.from("integration_logs").insert({
      provider, action: "checkout_payment", ok: true,
      message: `চেকআউট পেমেন্ট লিংক (৳${input.amount})`, payload: { invoice: input.invoice },
    });
    return json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await sb.from("integration_logs").insert({ provider, action: "checkout_payment", ok: false, message });
    return json({ error: message }, 400);
  }
});
