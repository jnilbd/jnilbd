import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "google/gemini-3-flash-preview";

const PROMPTS: Record<string, (i: any) => string> = {
  product: (i) =>
    `তুমি বাংলাদেশি ই-কমার্স কপিরাইটার। পণ্য: "${i.name}" (ধরন: ${i.type}, ক্যাটাগরি: ${i.category || "অজানা"}, দাম: ${i.price || "অজানা"}৳)।
শুধুমাত্র একটি JSON অবজেক্ট দাও, কোনো markdown ছাড়া, এই কী গুলো সহ:
{"name_bn":"","short_description":"","short_description_bn":"","full_description":"","full_description_bn":"","category":"","badge":""}
বাংলা লেখা সহজ, বিশ্বাসযোগ্য ও বিক্রয়মুখী হবে। full_description এ ৪-৬টি বুলেট পয়েন্ট রাখো।`,
  insight: (i) =>
    `তুমি একজন বাংলাদেশি বিজনেস অ্যানালিস্ট। নিচের ডেটা দেখে বাংলায় সংক্ষিপ্ত পরামর্শ দাও — ৩টি ভালো দিক, ৩টি সমস্যা, ৫টি করণীয়:\n${JSON.stringify(i, null, 2)}`,
  ad: (i) => `বাংলাদেশি ফেসবুক/টিকটক বিজ্ঞাপনের জন্য বাংলায় ৩টি হেডলাইন, ১টি প্রাইমারি টেক্সট ও ১টি CTA লেখো। বিষয়: ${i.prompt}`,
  campaign: (i) => `বাংলাদেশের জন্য ৭ দিনের ফেসবুক অ্যাড ক্যাম্পেইন প্ল্যান বাংলায় দাও — দৈনিক বাজেট, অডিয়েন্স, ক্রিয়েটিভ আইডিয়া, KPI। বিষয়: ${i.prompt}`,
  market: (i) => `বাংলাদেশের বাজারে এই পণ্যের চাহিদা, প্রতিযোগী, সম্ভাব্য দাম ও মুনাফা নিয়ে বাংলায় সংক্ষিপ্ত রিসার্চ দাও: ${i.prompt}`,
  reply: (i) => `একজন ভদ্র বাংলাদেশি দোকানির মতো বাংলায় সংক্ষিপ্ত, সহায়ক উত্তর লেখো। গ্রাহকের বার্তা: ${i.prompt}`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const task = String(body?.task || "");
    const input = body?.input || {};
    const build = PROMPTS[task];
    if (!build) return json({ error: "Unknown task" }, 400);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: build(input) }],
      }),
    });

    if (res.status === 429) return json({ error: "rate_limited" }, 429);
    if (res.status === 402) return json({ error: "payment_required" }, 402);
    if (!res.ok) return json({ error: await res.text() }, 500);

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";

    if (task === "product") {
      const m = text.match(/\{[\s\S]*\}/);
      let result: any = {};
      try { result = m ? JSON.parse(m[0]) : {}; } catch { result = {}; }
      return json({ result, text });
    }
    return json({ text });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
