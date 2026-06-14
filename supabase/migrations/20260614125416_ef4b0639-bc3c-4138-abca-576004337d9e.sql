
CREATE TABLE public.services_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_bn text,
  short_description text,
  short_description_bn text,
  full_description text,
  full_description_bn text,
  starting_price numeric NOT NULL DEFAULT 0,
  category text,
  image text,
  gallery jsonb DEFAULT '[]'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  features_bn jsonb DEFAULT '[]'::jsonb,
  badge text,
  badge_color text DEFAULT 'red',
  delivery_days integer,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services_catalog TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services_catalog TO authenticated;
GRANT ALL ON public.services_catalog TO service_role;
ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active services" ON public.services_catalog FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert services" ON public.services_catalog FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update services" ON public.services_catalog FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete services" ON public.services_catalog FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_catalog_updated BEFORE UPDATE ON public.services_catalog FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.services_catalog(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_address text,
  project_details text,
  quoted_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.service_orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.service_orders TO authenticated;
GRANT ALL ON public.service_orders TO service_role;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone places service orders" ON public.service_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own service orders" ON public.service_orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update service orders" ON public.service_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete service orders" ON public.service_orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
