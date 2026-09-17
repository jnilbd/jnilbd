-- RETURNS / REFUNDS
CREATE TABLE public.order_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.shop_orders(id) ON DELETE SET NULL,
  user_id uuid,
  customer_name text NOT NULL,
  customer_phone text,
  product_name text,
  reason text NOT NULL,
  kind text NOT NULL DEFAULT 'return',
  refund_amount numeric NOT NULL DEFAULT 0,
  refund_method text,
  status text NOT NULL DEFAULT 'requested',
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_returns TO authenticated;
GRANT INSERT ON public.order_returns TO anon;
GRANT ALL ON public.order_returns TO service_role;
ALTER TABLE public.order_returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage returns" ON public.order_returns FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own returns" ON public.order_returns FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Anyone can request a return" ON public.order_returns FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE TRIGGER order_returns_updated BEFORE UPDATE ON public.order_returns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- VISITOR / AD SOURCE ANALYTICS
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  device text,
  session_id text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.site_visits TO anon, authenticated;
GRANT SELECT ON public.site_visits TO authenticated;
GRANT ALL ON public.site_visits TO service_role;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a visit" ON public.site_visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read visits" ON public.site_visits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX site_visits_created_idx ON public.site_visits (created_at DESC);
CREATE INDEX site_visits_source_idx ON public.site_visits (utm_source);

-- GIVEAWAY / FREE DROP
CREATE TABLE public.giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_bn text,
  description text,
  prize text,
  image text,
  rules text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  max_entries integer,
  is_active boolean NOT NULL DEFAULT true,
  winner_entry_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.giveaways TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.giveaways TO authenticated;
GRANT ALL ON public.giveaways TO service_role;
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active giveaways" ON public.giveaways FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage giveaways" ON public.giveaways FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER giveaways_updated BEFORE UPDATE ON public.giveaways
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.giveaway_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  user_id uuid,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  note text,
  is_winner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (giveaway_id, phone)
);
GRANT INSERT ON public.giveaway_entries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.giveaway_entries TO authenticated;
GRANT ALL ON public.giveaway_entries TO service_role;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can enter" ON public.giveaway_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage entries" ON public.giveaway_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PUBLIC SITE SETTINGS (theme, popup, menu, tracking, store)
GRANT SELECT ON public.site_settings TO anon;
CREATE POLICY "Public can read presentation settings" ON public.site_settings FOR SELECT TO anon, authenticated
  USING (key IN ('store', 'tracking', 'theme', 'popup', 'menu'));