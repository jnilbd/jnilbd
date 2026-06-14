import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

type Body = {
  idea: string;
  platform: string; // facebook, instagram, google, tiktok, youtube, linkedin, twitter, all
  product?: string;
  audience?: string;
  tone?: string;
  language?: "bn" | "en" | "both";
  price?: string;
  imageUrl?: string;
  generateImage?: boolean;
  imagePrompt?: string;
};

function buildSystem(b: Body) {
  return `You are an elite Bangladeshi/Bengali ad copywriter, performance marketer, and creative director with 10+ years experience running profitable Facebook, Instagram, TikTok, YouTube, Google, and LinkedIn ads in Bangladesh and globally. You write conversion-focused copy that combines emotional hooks, social proof, and clear CTAs.

Return ONLY valid JSON, no markdown, no commentary. Follow the exact schema requested.

Language rule: ${b.language === "en" ? "Write everything in English." : b.language === "both" ? "Provide both Bengali (bn) and English (en) versions of every text field." : "Write in natural conversational Bengali (বাংলা) — the way real BD customers speak; use English brand names/jargon when natural."}`;
}

function buildPrompt(b: Body) {
  return `Create a complete, ad-ready content pack for the following.

IDEA / PRODUCT DESCRIPTION:
${b.idea}

${b.product ? `Product name: ${b.product}` : ""}
${b.price ? `Price: ${b.price}` : ""}
${b.audience ? `Target audience: ${b.audience}` : ""}
${b.tone ? `Tone: ${b.tone}` : "Tone: persuasive, friendly, urgent"}
Primary platform: ${b.platform}
${b.imageUrl ? `Reference image URL: ${b.imageUrl} (consider its visual style)` : ""}

Return JSON with this exact shape:
{
  "summary": "One-line ad concept summary",
  "hook_angles": ["3 different psychological angles (curiosity, fear-of-missing, social proof) to test"],
  "headlines": ["5 short attention-grabbing headlines, max 40 chars each"],
  "primary_texts": ["3 full ad copy variants (Hook + Problem + Solution + Benefit + CTA), each 80-150 words"],
  "descriptions": ["3 short descriptions, 1-2 lines each"],
  "ctas": ["5 CTA button options like 'অর্ডার করুন', 'Shop Now', 'এখনই কিনুন'"],
  "hashtags": ["12 relevant hashtags mixing Bangla + English + trending"],
  "platform_specs": {
    "facebook": { "primary_text": "...", "headline": "...", "description": "...", "cta": "...", "image_size": "1080x1080 or 1200x628", "video_duration": "15-30s" },
    "instagram": { "caption": "...", "first_line_hook": "...", "hashtags": "...", "reel_script_15s": "...", "story_text": "..." },
    "google": { "headlines_15char": ["max 30 chars each, 5 items"], "long_headline": "max 90 chars", "descriptions_90char": ["max 90 chars, 4 items"], "callouts": ["10 short callouts"], "sitelinks": ["4 sitelink text"] },
    "tiktok": { "video_hook_3s": "...", "script_30s": "step by step shot list with text overlays", "trending_sound_hint": "..." },
    "youtube": { "title": "...", "description": "...", "tags": ["10 tags"], "thumbnail_text": "...", "intro_5s_hook": "..." },
    "linkedin": { "headline": "...", "post_text": "professional B2B tone" },
    "twitter": { "tweet": "max 280 chars", "thread_3posts": ["3 connected tweets"] }
  },
  "targeting": {
    "age_range": "e.g. 18-45",
    "gender": "e.g. All / Female / Male",
    "locations": ["e.g. Dhaka, Chattogram, Sylhet"],
    "interests": ["8 interest keywords for Meta/Google targeting"],
    "behaviors": ["3 behavioral targets"],
    "lookalike_seed": "what audience to clone (e.g. past purchasers)"
  },
  "budget_recommendation": {
    "test_daily_budget_bdt": "e.g. ৳300-500",
    "scale_daily_budget_bdt": "e.g. ৳2000-5000",
    "expected_cpp_bdt": "expected cost per purchase",
    "expected_roas": "e.g. 2.5-4x"
  },
  "creative_brief": {
    "image_prompt": "Detailed AI image generation prompt for the ad creative (photorealistic, lighting, composition, text overlay specs)",
    "video_storyboard": ["6 shot descriptions for a 15-30 sec ad video"],
    "color_palette": ["3 hex codes that match the brand mood"],
    "music_mood": "e.g. upbeat, suspenseful, emotional"
  },
  "ab_test_plan": ["4 concrete A/B test ideas to run in week 1"],
  "compliance_warnings": ["any Facebook/Google ad policy concerns to avoid"]
}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const body = (await req.json()) as Body;
    if (!body?.idea || body.idea.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Idea is required (min 5 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Generate ad content pack
    const userContent: any[] = [{ type: "text", text: buildPrompt(body) }];
    if (body.imageUrl) {
      userContent.push({ type: "image_url", image_url: { url: body.imageUrl } });
    }

    const chatRes = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: buildSystem(body) },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!chatRes.ok) {
      const txt = await chatRes.text();
      return new Response(JSON.stringify({ error: `AI error ${chatRes.status}: ${txt.slice(0, 300)}` }), {
        status: chatRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chatData = await chatRes.json();
    const rawText = chatData?.choices?.[0]?.message?.content ?? "{}";
    let pack: any;
    try {
      pack = JSON.parse(rawText);
    } catch {
      const m = rawText.match(/\{[\s\S]*\}/);
      pack = m ? JSON.parse(m[0]) : { raw: rawText };
    }

    // 2. Optionally generate ad image
    let generatedImage: string | null = null;
    if (body.generateImage) {
      const imgPrompt = body.imagePrompt || pack?.creative_brief?.image_prompt || `Professional advertisement image for: ${body.idea}. Photorealistic, bright lighting, eye-catching, no text overlay.`;
      try {
        const imgRes = await fetch(`${GATEWAY}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": LOVABLE_API_KEY,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: imgPrompt }],
            modalities: ["image", "text"],
          }),
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const imgUrl = imgData?.choices?.[0]?.message?.images?.[0]?.image_url?.url
            || imgData?.choices?.[0]?.message?.content;
          if (typeof imgUrl === "string" && imgUrl.startsWith("data:")) {
            generatedImage = imgUrl;
          } else if (typeof imgUrl === "string" && imgUrl.startsWith("http")) {
            generatedImage = imgUrl;
          }
        }
      } catch (_) { /* ignore image errors */ }
    }

    return new Response(JSON.stringify({ pack, generatedImage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
