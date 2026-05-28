
CREATE TABLE public.train_alert_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  channel TEXT NOT NULL DEFAULT 'browser',
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  journey_date DATE NOT NULL,
  train_number TEXT,
  seat_class TEXT,
  language TEXT NOT NULL DEFAULT 'bn',
  active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  last_notified_at TIMESTAMPTZ,
  last_seats_found INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_train_alert_subs_active ON public.train_alert_subscribers(active, journey_date);
CREATE INDEX idx_train_alert_subs_phone ON public.train_alert_subscribers(phone);

GRANT SELECT, INSERT, UPDATE ON public.train_alert_subscribers TO anon, authenticated;
GRANT ALL ON public.train_alert_subscribers TO service_role;

ALTER TABLE public.train_alert_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to train alerts"
  ON public.train_alert_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own subscriptions by phone"
  ON public.train_alert_subscribers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update (unsubscribe) by phone"
  ON public.train_alert_subscribers FOR UPDATE
  USING (true);

CREATE TRIGGER trg_train_alert_subs_updated
  BEFORE UPDATE ON public.train_alert_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.train_alert_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.train_alert_subscribers(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  train_name TEXT NOT NULL,
  train_number TEXT NOT NULL,
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  journey_date DATE NOT NULL,
  seats_available INTEGER NOT NULL DEFAULT 0,
  seat_class TEXT,
  message TEXT NOT NULL,
  delivered_browser BOOLEAN NOT NULL DEFAULT false,
  delivered_sms BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_train_alert_notif_phone ON public.train_alert_notifications(phone, created_at DESC);
CREATE INDEX idx_train_alert_notif_sub ON public.train_alert_notifications(subscriber_id);

GRANT SELECT, INSERT ON public.train_alert_notifications TO anon, authenticated;
GRANT ALL ON public.train_alert_notifications TO service_role;

ALTER TABLE public.train_alert_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notifications"
  ON public.train_alert_notifications FOR SELECT
  USING (true);

CREATE POLICY "Service role inserts notifications"
  ON public.train_alert_notifications FOR INSERT
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.train_alert_notifications;
ALTER TABLE public.train_alert_notifications REPLICA IDENTITY FULL;
