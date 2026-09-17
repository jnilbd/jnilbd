import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const admin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

type Cfg = Record<string, any>;

function need(cfg: Cfg, keys: string[], provider: string) {
  const missing = keys.filter((k) => !String(cfg?.[k] ?? "").trim());
  if (missing.length) throw new Error(`${provider}: এই তথ্যগুলো এখনো দেওয়া হয়নি — ${missing.join(", ")}`);
}

async function jfetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch { /* keep text */ }
  if (!res.ok) throw new Error(typeof body === "string" ? body.slice(0, 400) : JSON.stringify(body).slice(0, 400));
  return body;
}

/* ------------------------------- providers ------------------------------- */

const steadfast = {
  base: (c: Cfg) => (c.base_url || "https://portal.packzy.com/api/v1").replace(/\/$/, ""),
  headers: (c: Cfg) => ({ "Api-Key": c.api_key, "Secret-Key": c.secret_key, "Content-Type": "application/json" }),
  async test(c: Cfg) {
    need(c, ["api_key", "secret_key"], "Steadfast");
    const r = await jfetch(`${steadfast.base(c)}/get_balance`, { headers: steadfast.headers(c) });
    return { message: `ব্যালেন্স: ${r?.current_balance ?? "—"}`, data: r };
  },
  async create_order(c: Cfg, i: Cfg) {
    need(c, ["api_key", "secret_key"], "Steadfast");
    const r = await jfetch(`${steadfast.base(c)}/create_order`, {
      method: "POST", headers: steadfast.headers(c),
      body: JSON.stringify({
        invoice: i.invoice, recipient_name: i.name, recipient_phone: i.phone,
        recipient_address: i.address, cod_amount: Number(i.cod || 0), note: i.note || "",
      }),
    });
    return { message: `কনসাইনমেন্ট: ${r?.consignment?.consignment_id ?? "তৈরি হয়েছে"}`, data: r };
  },
  async track(c: Cfg, i: Cfg) {
    need(c, ["api_key", "secret_key"], "Steadfast");
    const r = await jfetch(`${steadfast.base(c)}/status_by_trackingcode/${encodeURIComponent(i.tracking)}`, { headers: steadfast.headers(c) });
    return { message: `অবস্থা: ${r?.delivery_status ?? "—"}`, data: r };
  },
};

const pathao = {
  base: (c: Cfg) => (c.base_url || (c.sandbox ? "https://courier-api-sandbox.pathao.com" : "https://api-hermes.pathao.com")).replace(/\/$/, ""),
  async token(c: Cfg) {
    need(c, ["client_id", "client_secret", "username", "password"], "Pathao");
    const r = await jfetch(`${pathao.base(c)}/aladdin/api/v1/issue-token`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: c.client_id, client_secret: c.client_secret,
        username: c.username, password: c.password, grant_type: "password",
      }),
    });
    return r.access_token as string;
  },
  async test(c: Cfg) {
    const t = await pathao.token(c);
    return { message: t ? "Pathao টোকেন পাওয়া গেছে" : "টোকেন পাওয়া যায়নি" };
  },
  async create_order(c: Cfg, i: Cfg) {
    need(c, ["store_id"], "Pathao");
    const t = await pathao.token(c);
    const r = await jfetch(`${pathao.base(c)}/aladdin/api/v1/orders`, {
      method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        store_id: Number(c.store_id), merchant_order_id: i.invoice, recipient_name: i.name,
        recipient_phone: i.phone, recipient_address: i.address, recipient_city: Number(i.city || 1),
        recipient_zone: Number(i.zone || 1), delivery_type: 48, item_type: 2,
        item_quantity: Number(i.qty || 1), item_weight: Number(i.weight || 0.5),
        amount_to_collect: Number(i.cod || 0), item_description: i.note || "",
      }),
    });
    return { message: `Pathao কনসাইনমেন্ট: ${r?.data?.consignment_id ?? "তৈরি"}`, data: r };
  },
};

const bkash = {
  base: (c: Cfg) => (c.sandbox
    ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    : "https://tokenized.pay.bka.sh/v1.2.0-beta"),
  async token(c: Cfg) {
    need(c, ["username", "password", "app_key", "app_secret"], "bKash");
    const r = await jfetch(`${bkash.base(c)}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: { "Content-Type": "application/json", username: c.username, password: c.password },
      body: JSON.stringify({ app_key: c.app_key, app_secret: c.app_secret }),
    });
    if (!r?.id_token) throw new Error(r?.statusMessage || "bKash টোকেন পাওয়া যায়নি");
    return r.id_token as string;
  },
  async test(c: Cfg) {
    await bkash.token(c);
    return { message: "bKash সংযোগ ঠিক আছে" };
  },
  async create_payment(c: Cfg, i: Cfg) {
    const t = await bkash.token(c);
    const r = await jfetch(`${bkash.base(c)}/tokenized/checkout/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: t, "X-App-Key": c.app_key },
      body: JSON.stringify({
        mode: "0011", payerReference: i.phone || "01", callbackURL: c.callback_url || i.callback,
        amount: String(i.amount), currency: "BDT", intent: "sale", merchantInvoiceNumber: i.invoice,
      }),
    });
    return { message: "পেমেন্ট লিংক তৈরি", data: r, url: r?.bkashURL };
  },
};

const sslcommerz = {
  async create_session(c: Cfg, i: Cfg) {
    need(c, ["store_id", "store_passwd"], "SSLCommerz");
    const host = c.sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
    const form = new URLSearchParams({
      store_id: c.store_id, store_passwd: c.store_passwd, total_amount: String(i.amount),
      currency: "BDT", tran_id: i.invoice, success_url: c.success_url || i.callback || "",
      fail_url: c.fail_url || i.callback || "", cancel_url: c.cancel_url || i.callback || "",
      cus_name: i.name || "Customer", cus_email: i.email || "n@a.com", cus_phone: i.phone || "01700000000",
      cus_add1: i.address || "Dhaka", cus_city: "Dhaka", cus_country: "Bangladesh",
      shipping_method: "NO", product_name: i.product || "Order", product_category: "general", product_profile: "general",
    });
    const r = await jfetch(`${host}/gwprocess/v4/api.php`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form,
    });
    if (r?.status !== "SUCCESS") throw new Error(r?.failedreason || "সেশন তৈরি হয়নি");
    return { message: "পেমেন্ট সেশন তৈরি", data: r, url: r.GatewayPageURL };
  },
  async test(c: Cfg) {
    await sslcommerz.create_session(c, { amount: 10, invoice: `test-${Date.now()}`, callback: c.success_url || "https://example.com" });
    return { message: "SSLCommerz সংযোগ ঠিক আছে" };
  },
};

const telegram = {
  async test(c: Cfg) {
    need(c, ["bot_token"], "Telegram");
    const r = await jfetch(`https://api.telegram.org/bot${c.bot_token}/getMe`);
    return { message: `বট: @${r?.result?.username ?? "—"}`, data: r };
  },
  async fetch_products(c: Cfg, i: Cfg, db: any) {
    need(c, ["bot_token"], "Telegram");
    const r = await jfetch(`https://api.telegram.org/bot${c.bot_token}/getUpdates?limit=${Number(i.limit || 30)}`);
    const msgs = (r?.result || [])
      .map((u: any) => u.channel_post || u.message)
      .filter((m: any) => m?.text || m?.caption);
    let added = 0;
    for (const m of msgs) {
      const text: string = m.text || m.caption;
      const name = text.split("\n")[0].slice(0, 120);
      const price = Number((text.match(/(\d[\d,]{2,})\s*(৳|tk|taka|টাকা)/i)?.[1] || "0").replace(/,/g, ""));
      if (!name) continue;
      const { data: exists } = await db.from("shop_products").select("id").eq("name", name).maybeSingle();
      if (exists) continue;
      const { error } = await db.from("shop_products").insert({
        name, full_description: text, price: price || 0, product_type: "physical",
        is_active: false, category: c.default_category || "সোর্সিং",
      });
      if (!error) added++;
    }
    return { message: `${added} টি নতুন পণ্য ড্রাফট হিসেবে যোগ হয়েছে (${msgs.length} বার্তা দেখা হয়েছে)` };
  },
};

const facebook = {
  async test(c: Cfg) {
    need(c, ["page_access_token"], "Facebook");
    const r = await jfetch(`https://graph.facebook.com/v21.0/me?access_token=${encodeURIComponent(c.page_access_token)}`);
    return { message: `সংযুক্ত: ${r?.name ?? r?.id}`, data: r };
  },
  async import_posts(c: Cfg, i: Cfg, db: any) {
    need(c, ["page_id", "page_access_token"], "Facebook");
    const r = await jfetch(
      `https://graph.facebook.com/v21.0/${c.page_id}/posts?fields=id,message,created_time,full_picture,permalink_url&limit=${Number(i.limit || 10)}&access_token=${encodeURIComponent(c.page_access_token)}`,
    );
    let added = 0;
    for (const p of r?.data || []) {
      if (!p.message) continue;
      const title = p.message.split("\n")[0].slice(0, 140);
      const slug = `fb-${p.id.replace(/[^a-z0-9]/gi, "-").slice(-24)}`;
      const { data: exists } = await db.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
      if (exists) continue;
      const { error } = await db.from("blog_posts").insert({
        slug, title, title_bn: title, content: p.message, content_bn: p.message,
        excerpt: p.message.slice(0, 200), cover_image: p.full_picture || null,
        source_url: p.permalink_url || null, category: "ফেসবুক", author: c.author || "John Nil",
        is_published: !!c.auto_publish, published_at: p.created_time,
      });
      if (!error) added++;
    }
    return { message: `${added} টি ফেসবুক পোস্ট ব্লগে যোগ হয়েছে` };
  },
  async create_campaign(c: Cfg, i: Cfg) {
    need(c, ["ad_account_id", "page_access_token"], "Facebook Ads");
    const acct = String(c.ad_account_id).startsWith("act_") ? c.ad_account_id : `act_${c.ad_account_id}`;
    const form = new URLSearchParams({
      name: i.name || "Campaign", objective: i.objective || "OUTCOME_SALES",
      status: i.status || "PAUSED", special_ad_categories: "[]", access_token: c.page_access_token,
    });
    const r = await jfetch(`https://graph.facebook.com/v21.0/${acct}/campaigns`, { method: "POST", body: form });
    return { message: `ক্যাম্পেইন তৈরি (${i.status === "ACTIVE" ? "চালু" : "পজ করা"}): ${r?.id}`, data: r };
  },
};

const resend = {
  async test(c: Cfg) {
    need(c, ["api_key"], "Resend");
    const r = await jfetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${c.api_key}` } });
    return { message: `ডোমেইন সংখ্যা: ${(r?.data || []).length}`, data: r };
  },
  async send_email(c: Cfg, i: Cfg) {
    need(c, ["api_key", "from_email"], "Resend");
    const r = await jfetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${c.api_key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: c.from_email, to: [i.to], subject: i.subject || "Notification",
        html: i.html || `<p>${i.text || ""}</p>`,
      }),
    });
    return { message: `ইমেইল পাঠানো হয়েছে (${i.to})`, data: r };
  },
};

const trending = {
  async search(c: Cfg, i: Cfg) {
    need(c, ["rapidapi_key", "rapidapi_host"], "ট্রেন্ডিং ইমপোর্ট");
    const q = encodeURIComponent(i.keyword || c.default_keyword || "gadget");
    const url = (c.search_path || "https://{host}/search?q={q}").replace("{host}", c.rapidapi_host).replace("{q}", q);
    const r = await jfetch(url, {
      headers: { "X-RapidAPI-Key": c.rapidapi_key, "X-RapidAPI-Host": c.rapidapi_host },
    });
    return { message: "ফলাফল পাওয়া গেছে", data: r };
  },
  async test(c: Cfg) {
    await trending.search(c, {});
    return { message: "ট্রেন্ডিং সোর্স সংযোগ ঠিক আছে" };
  },
  async import(c: Cfg, i: Cfg, db: any) {
    const r: any = await trending.search(c, i);
    const list: any[] = r?.data?.products || r?.data?.results || r?.data?.items || r?.data?.data || [];
    let added = 0;
    for (const p of list.slice(0, Number(i.limit || 20))) {
      const name = String(p.title || p.name || "").slice(0, 140);
      if (!name) continue;
      const { data: exists } = await db.from("shop_products").select("id").eq("name", name).maybeSingle();
      if (exists) continue;
      const price = Number(String(p.price || p.sale_price || 0).replace(/[^\d.]/g, "")) || 0;
      const { error } = await db.from("shop_products").insert({
        name, price: Math.round(price * Number(c.price_multiplier || 1)),
        image: p.image || p.thumbnail || p.image_url || null,
        full_description: p.description || name, product_type: "physical",
        is_active: false, category: c.default_category || "ট্রেন্ডিং",
      });
      if (!error) added++;
    }
    return { message: `${added} টি ট্রেন্ডিং পণ্য ড্রাফট হিসেবে যোগ হয়েছে` };
  },
};

const HANDLERS: Record<string, Record<string, (c: Cfg, i: Cfg, db: any) => Promise<any>>> = {
  steadfast: { test: steadfast.test, create_order: steadfast.create_order, track: steadfast.track },
  pathao: { test: pathao.test, create_order: pathao.create_order },
  bkash: { test: bkash.test, create_payment: bkash.create_payment },
  sslcommerz: { test: sslcommerz.test, create_session: sslcommerz.create_session },
  telegram: { test: telegram.test, fetch_products: telegram.fetch_products },
  facebook: { test: facebook.test, import_posts: facebook.import_posts, create_campaign: facebook.create_campaign },
  resend: { test: resend.test, send_email: resend.send_email },
  trending: { test: trending.test, import: trending.import },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const db = admin();
  let provider = "", action = "";
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: userData } = await anon.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    provider = String(body?.provider || "");
    action = String(body?.action || "test");
    const input = body?.input || {};

    const group = HANDLERS[provider];
    if (!group) return json({ error: "অজানা সার্ভিস" }, 400);
    const handler = group[action];
    if (!handler) return json({ error: "এই সার্ভিসে এমন কাজ নেই" }, 400);

    const { data: row } = await db.from("integration_settings").select("*").eq("provider", provider).maybeSingle();
    if (!row) return json({ error: "আগে সেটিংস সেভ করুন" }, 400);
    if (!row.enabled && action !== "test") return json({ error: "এই সার্ভিসটি এখনো চালু করা হয়নি" }, 400);

    const result = await handler(row.config || {}, input, db);

    await db.from("integration_logs").insert({ provider, action, ok: true, message: result?.message ?? "সফল" });
    if (action === "test") {
      await db.from("integration_settings").update({
        last_test_at: new Date().toISOString(), last_test_ok: true, last_test_message: result?.message ?? "সফল",
      }).eq("provider", provider);
    }
    return json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await db.from("integration_logs").insert({ provider, action, ok: false, message }).catch?.(() => {});
    if (action === "test" && provider) {
      await db.from("integration_settings").update({
        last_test_at: new Date().toISOString(), last_test_ok: false, last_test_message: message,
      }).eq("provider", provider);
    }
    return json({ error: message }, 400);
  }
});
