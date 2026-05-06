CREATE TABLE public.weather_alert_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  name TEXT,
  city TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lon NUMERIC NOT NULL,
  language TEXT NOT NULL DEFAULT 'bn',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (phone, city)
);

ALTER TABLE public.weather_alert_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to weather alerts"
ON public.weather_alert_subscribers
FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Anyone can unsubscribe by phone"
ON public.weather_alert_subscribers
FOR UPDATE TO public
USING (true);

CREATE TRIGGER weather_alert_subscribers_updated_at
BEFORE UPDATE ON public.weather_alert_subscribers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();