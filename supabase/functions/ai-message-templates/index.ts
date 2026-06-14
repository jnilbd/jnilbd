import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { occasion, relationship = "", recipientName = "", senderName = "", tone = "warm", language = "bn", count = 18 } = await req.json();
    if (!occasion) return new Response(JSON.stringify({ error: "occasion required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const langLabel = language === "bn" ? "Bangla (বাংলা)" : "English";
    const sys = `You generate ready-to-send personal messages for WhatsApp/SMS. Return STRICT JSON only:
{ "messages": [ { "title": "short label (3-5 words)", "text": "full message (1-4 sentences, max 320 chars)" } ] }
Rules:
- Produce exactly ${Math.min(Math.max(count, 10), 25)} unique messages.
- Language: ${langLabel}. Natural and culturally appropriate.
- Vary tones: heartfelt, poetic, funny, romantic, formal, short, long, Islamic dua style if relevant.
- If recipientName provided, address them naturally. Don't repeat the same opening.
- Include 1-2 with light emoji, others clean.
- No markdown, no numbering inside text. JSON only.`;

    const user = `Occasion: ${occasion}
Relationship: ${relationship || "(unspecified)"}
Recipient name: ${recipientName || "(none)"}
Sender name: ${senderName || "(none)"}
Tone preference: ${tone}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });
    const txt = await r.text();
    if (!r.ok) return new Response(JSON.stringify({ error: txt, status: r.status }), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const data = JSON.parse(txt);
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any = { messages: [] };
    try { parsed = JSON.parse(content); } catch {}
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
