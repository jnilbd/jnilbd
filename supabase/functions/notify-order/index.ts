import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: 'order_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: order, error: orderErr } = await supabase
      .from('shop_orders').select('*').eq('id', order_id).maybeSingle();
    if (orderErr || !order) throw new Error(orderErr?.message || 'Order not found');

    const { data: settings } = await supabase
      .from('admin_notification_settings').select('*').limit(1).maybeSingle();

    const msg =
      `🛒 *New Order!*\n` +
      `Product: ${order.product_name}\n` +
      `Qty: ${order.quantity}\n` +
      `Total: ৳${order.total_amount}\n` +
      `Customer: ${order.customer_name}\n` +
      `Phone: ${order.customer_phone}\n` +
      (order.customer_email ? `Email: ${order.customer_email}\n` : '') +
      (order.customer_address ? `Address: ${order.customer_address}\n` : '') +
      (order.notes ? `Notes: ${order.notes}\n` : '') +
      `Order ID: ${order.id}`;

    const results: Record<string, unknown> = {};

    // WhatsApp / SMS via Twilio
    const twilioApiKey = Deno.env.get('TWILIO_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const waFrom = Deno.env.get('TWILIO_WHATSAPP_FROM');
    const smsFrom = Deno.env.get('TWILIO_PHONE_FROM');

    if (settings?.enable_whatsapp && settings.whatsapp_number && twilioApiKey && lovableKey && waFrom) {
      try {
        const form = new URLSearchParams();
        form.append('To', `whatsapp:${settings.whatsapp_number}`);
        form.append('From', `whatsapp:${waFrom}`);
        form.append('Body', msg);
        const r = await fetch('https://connector-gateway.lovable.dev/twilio/2010-04-01/Accounts/-/Messages.json', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            'X-Connection-Api-Key': twilioApiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        });
        results.whatsapp = { status: r.status, ok: r.ok };
      } catch (e) { results.whatsapp = { error: String(e) }; }
    }

    if (settings?.enable_sms && settings.sms_number && twilioApiKey && lovableKey && smsFrom) {
      try {
        const form = new URLSearchParams();
        form.append('To', settings.sms_number);
        form.append('From', smsFrom);
        form.append('Body', msg);
        const r = await fetch('https://connector-gateway.lovable.dev/twilio/2010-04-01/Accounts/-/Messages.json', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            'X-Connection-Api-Key': twilioApiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        });
        results.sms = { status: r.status, ok: r.ok };
      } catch (e) { results.sms = { error: String(e) }; }
    }

    // Telegram
    const tgKey = Deno.env.get('TELEGRAM_API_KEY');
    if (settings?.enable_telegram && settings.telegram_chat_id && tgKey && lovableKey) {
      try {
        const r = await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            'X-Connection-Api-Key': tgKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: settings.telegram_chat_id,
            text: msg,
            parse_mode: 'Markdown',
          }),
        });
        results.telegram = { status: r.status, ok: r.ok };
      } catch (e) { results.telegram = { error: String(e) }; }
    }

    await supabase.from('shop_orders').update({ notified: true }).eq('id', order_id);

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
