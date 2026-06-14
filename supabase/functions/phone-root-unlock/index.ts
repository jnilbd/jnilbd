import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { model, mode } = await req.json();
    if (!model || !mode) {
      return new Response(JSON.stringify({ error: 'model and mode required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompts: Record<string, string> = {
      twrp: `Find official and unofficial TWRP/OrangeFox/PBRP custom recovery images for the phone model: "${model}".
Return STRICT JSON ONLY:
{
  "model": "...",
  "codename": "...",
  "official": [{"name":"TWRP Official","version":"3.7.x","url":"https://...","notes":"..."}],
  "unofficial": [{"name":"OrangeFox by ...","version":"...","url":"https://...","notes":"port info"}],
  "flashing_guide_bn": ["step 1 in Bangla","step 2..."],
  "youtube_search": "search query"
}`,
      roms: `Find available custom ROMs for "${model}". Separate into official-project ROMs (LineageOS, crDroid, PixelOS, Evolution X, ArrowOS, RisingOS, etc.) and unofficial/ports.
Return STRICT JSON:
{
  "model":"...", "codename":"...",
  "official":[{"name":"LineageOS 21","android":"14","url":"https://...","maintainer":"...","notes":"..."}],
  "unofficial":[{"name":"crDroid port","android":"14","url":"https://...","maintainer":"XDA user","notes":"..."}],
  "install_guide_bn":["step 1","step 2..."],
  "youtube_search":"..."
}`,
      recovery: `Phone "${model}" is bricked/dead/bootloop. Provide official stock firmware (ROM) sources + recovery method.
Return STRICT JSON:
{
  "model":"...","brand":"...",
  "stock_firmware":[{"source":"SamMobile/Mi Flash/...","url":"https://...","notes":"..."}],
  "tools":[{"name":"Odin / MiFlash / SP Flash Tool","url":"https://...","use":"..."}],
  "recovery_steps_bn":["1. ...","2. ..."],
  "warnings_bn":["...","..."],
  "youtube_search":"..."
}`,
      unlock: `Phone "${model}" has a lock problem. Provide solutions for FRP / Google account lock / KG lock / Knox / MDM / Kisti (installment) lock / admin lock.
Return STRICT JSON:
{
  "model":"...","brand":"...",
  "solutions":[
    {"lock_type":"FRP","difficulty":"easy/medium/hard","tools":["..."],"steps_bn":["step 1","step 2"],"download_links":[{"name":"...","url":"https://..."}],"youtube_search":"..."},
    {"lock_type":"KG/Knox","difficulty":"...","tools":["..."],"steps_bn":["..."],"download_links":[],"youtube_search":"..."},
    {"lock_type":"Kisti/Installment Lock","difficulty":"...","tools":["..."],"steps_bn":["..."],"download_links":[],"youtube_search":"..."},
    {"lock_type":"Admin/MDM Lock","difficulty":"...","tools":["..."],"steps_bn":["..."],"download_links":[],"youtube_search":"..."}
  ],
  "warnings_bn":["legal warning bn","..."]
}`,
    };

    const prompt = prompts[mode];
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'invalid mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an Android modding expert. Return STRICT JSON only, no markdown, no commentary. Include real URLs from twrp.me, xda-developers.com, lineageos.org, crdroid.net, pixelexperience, sammobile, mi.com, etc. If unsure, provide best-guess search-style URLs.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: t }), {
        status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    let content = data.choices?.[0]?.message?.content ?? '{}';
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let parsed;
    try { parsed = JSON.parse(content); }
    catch { parsed = { raw: content }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
