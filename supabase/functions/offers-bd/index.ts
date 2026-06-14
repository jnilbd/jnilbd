import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { store } = await req.json().catch(() => ({ store: 'all' }));
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    const focus = store && store !== 'all' ? `Focus mainly on "${store}".` : 'Cover all major BD retailers.';

    const prompt = `তুমি বাংলাদেশের অফার এক্সপার্ট। আজকের তারিখ ${today}। বাংলাদেশের বিভিন্ন সুপারমার্কেট, ই-কমার্স এবং গ্রোসারি দোকানে বর্তমানে চলমান অফার/ডিসকাউন্ট/ফ্রি প্রোডাক্ট অফার এর একটি বাস্তবসম্মত তালিকা দাও।

${focus}

প্রধান স্টোরসমূহ: Chaldal, Shwapno, Meena Bazar, Agora, Daraz, Foodpanda, Pathao, Pickaboo, Othoba, Rokomari, PriyoShop, Daraz Mall, Unimart, Best Buy BD, Transcom Digital, MyOne, Singer, Symphony, Walton, Robi, GP, Banglalink, Pizza Hut BD, KFC BD, BFC, Sultan's Dine.

প্রতিটি অফারে থাকতে হবে: স্টোর, প্রোডাক্ট/ক্যাটাগরি, অফার টাইপ (ডিসকাউন্ট/ফ্রি/বান্ডেল/ক্যাশব্যাক), বিস্তারিত (বাংলায়), মূল দাম, অফার দাম (যদি প্রযোজ্য), ডিসকাউন্ট %, ভ্যালিডিটি, কুপন কোড (থাকলে), লিংক।

STRICT JSON only (no markdown):
{
  "updated": "${today}",
  "offers": [
    {
      "store": "Chaldal",
      "category": "Grocery",
      "product": "চাল/ডাল/তেল ইত্যাদি",
      "type": "discount|free|bundle|cashback",
      "title_bn": "...",
      "details_bn": "যেমন: ৫ কেজি চাল কিনলে ১ কেজি ডাল ফ্রি",
      "original_price": 500,
      "offer_price": 400,
      "discount_pct": 20,
      "coupon": "CHAL20",
      "valid_till": "DD MMM YYYY",
      "link": "https://chaldal.com/..."
    }
  ]
}

কমপক্ষে ২৫-৩৫টি বাস্তবধর্মী অফার দাও। দাম, কোড, লিংক বাস্তবসম্মত হতে হবে (যদি নিশ্চিত না হও, স্টোরের হোমপেজ লিংক দাও)। বাংলা ভাষায় details_bn লেখো।`;

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a Bangladesh retail offers expert. Return STRICT JSON only.' },
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
    catch {
      const m = content.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { offers: [], raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
