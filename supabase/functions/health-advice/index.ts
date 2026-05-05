// AI-powered health advice using Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, language } = await req.json();
    if (!question || typeof question !== "string" || question.length > 500) {
      return json({ error: "invalid question" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

    const lang = language === "bn" ? "Bengali (বাংলা)" : "English";
    const systemPrompt = `You are a friendly health advisor for people in Bangladesh. Always respond in ${lang}.
Provide general health guidance only — never diagnose.
Structure your answer:
1) Possible causes (2–3 bullets)
2) Home remedies / what to eat / avoid
3) Over-the-counter options common in Bangladesh (paracetamol, ORS, antacid etc.) with safe doses
4) When to see a doctor (clear red flags)
5) Brief note: this is general advice, see a doctor for serious cases.
Keep it concise (under 250 words). Use bullet points.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return json({ error: `AI failed: ${res.status} ${text}` }, 502);
    }

    const data = await res.json();
    const advice = data?.choices?.[0]?.message?.content || "";
    return json({ advice });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
