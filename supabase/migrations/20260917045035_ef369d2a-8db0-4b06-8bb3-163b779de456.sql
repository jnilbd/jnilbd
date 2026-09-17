CREATE TABLE public.landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  title_bn text,
  seo_title text,
  seo_description text,
  cover_image text,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.landing_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_pages TO authenticated;
GRANT ALL ON public.landing_pages TO service_role;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published landing pages are viewable by everyone"
  ON public.landing_pages FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage landing pages"
  ON public.landing_pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER landing_pages_updated_at BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  subject text NOT NULL,
  html text NOT NULL,
  trigger_event text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email templates"
  ON public.email_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.email_templates (key, name, subject, html, trigger_event) VALUES
('order_placed','অর্ডার পাওয়া গেছে','আপনার অর্ডার #{{order_id}} পাওয়া গেছে','<p>প্রিয় {{customer_name}},</p><p>আপনার অর্ডার <b>#{{order_id}}</b> আমরা পেয়েছি। পণ্য: {{product_name}} — মোট ৳{{total}}।</p><p>ধন্যবাদ, JOHN NIL</p>','order_placed'),
('order_confirmed','অর্ডার কনফার্ম','আপনার অর্ডার #{{order_id}} কনফার্ম হয়েছে','<p>প্রিয় {{customer_name}},</p><p>আপনার অর্ডার কনফার্ম হয়েছে এবং প্রস্তুত করা হচ্ছে।</p><p>JOHN NIL</p>','order_confirmed'),
('order_shipped','পণ্য পাঠানো হয়েছে','আপনার অর্ডার পাঠানো হয়েছে','<p>প্রিয় {{customer_name}},</p><p>আপনার পণ্য কুরিয়ারে দেওয়া হয়েছে। কুরিয়ার: {{courier}} • ট্র্যাকিং: {{tracking}}</p><p>JOHN NIL</p>','order_shipped'),
('order_delivered','ডেলিভারি সম্পন্ন','ধন্যবাদ! অর্ডার ডেলিভারড','<p>প্রিয় {{customer_name}},</p><p>আপনার অর্ডার ডেলিভার হয়েছে। রিভিউ দিলে খুশি হবো।</p><p>JOHN NIL</p>','order_delivered');