import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { audioBase64, format = "webm", language = "bn" } = await req.json();
    if (!audioBase64) return new Response(JSON.stringify({ error: "audioBase64 required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sys = `You are an expert music producer AI. Analyze the user's raw vocal recording (singing or humming or speaking).
Return STRICT JSON only with this schema:
{
  "transcript": string,         // what was said/sung (in original language)
  "language": string,           // detected language
  "mood": string,               // e.g. happy, sad, romantic, energetic, melancholic, devotional
  "genre": string,              // best-fit genre: pop, lofi, cinematic, folk, rock, classical, edm, hiphop, ambient, devotional
  "bpm": number,                // estimated tempo 60-180
  "key": string,                // musical key like "C major", "A minor", "D minor"
  "scale": "major" | "minor",
  "chords": string[],           // 4-8 chord progression names like ["Am","F","C","G"]
  "instruments": string[],      // recommended instruments
  "lyrics_suggestion": string,  // 4-8 lines extended lyrics matching the vibe (${language})
  "production_notes": string,   // short tip
  "title_suggestion": string
}
No markdown. JSON only.`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: [
          { type: "text", text: "Analyze this vocal and design a full song around it." },
          { type: "input_audio", input_audio: { data: audioBase64, format } },
        ] },
      ],
      response_format: { type: "json_object" },
    };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify(body),
    });
    const txt = await r.text();
    if (!r.ok) return new Response(JSON.stringify({ error: txt, status: r.status }), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const data = JSON.parse(txt);
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
