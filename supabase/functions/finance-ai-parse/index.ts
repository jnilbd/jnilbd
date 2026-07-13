import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { text, wallets = [] } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const walletList = wallets
      .map((w: any) => `- ${w.name} (${w.type}${w.provider ? "/" + w.provider : ""}) [id:${w.id}]`)
      .join("\n");

    const system = `You are a Bangladeshi personal & business finance parser.
Parse the user's free-form text (Bangla, English, or Banglish) into ONE structured JSON transaction.
Return ONLY valid JSON matching this shape:
{
  "type": "income|expense|transfer|sale|purchase|loan_given|loan_taken|repayment_in|repayment_out|return_in|return_out",
  "amount": number,
  "wallet_id": "uuid or null",
  "transfer_to_wallet_id": "uuid or null (only for transfer)",
  "category": "Food|Transport|Shopping|Medicine|Education|Family|Kids|Entertainment|Internet|Mobile Recharge|Bills|Travel|Rent|Investment|Savings|Salary|Advertising|Courier|Office Rent|Utility|Other",
  "scope": "personal|business",
  "party": "customer/supplier/person name or null",
  "note": "short note",
  "confidence": 0.0-1.0
}

Available wallets:
${walletList || "(none — pick null)"}

Rules:
- "khoros/khorca/kharoch/expense/khoroch" = expense
- "ay/income/paisi/received/pelam" = income
- "bikri/sale/sold" = sale
- "kinlam/purchase/bought" = purchase
- "transfer/pathalam/dilam wallet-e" = transfer
- "tk/taka/৳" = BDT amount
- Match wallet by name substring (bKash, Nagad, Cash, Bank, etc). If unclear, use null.
- Prefer scope=business for sale/purchase/courier/office; personal otherwise.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      return new Response(JSON.stringify({ error: "AI error", status: res.status, details: errBody }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }
    return new Response(JSON.stringify({ parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
