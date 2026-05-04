
CREATE TABLE public.marketplace_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  condition TEXT NOT NULL DEFAULT 'Used',
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view marketplace items"
  ON public.marketplace_items FOR SELECT USING (true);

CREATE POLICY "Anyone can create a marketplace item"
  ON public.marketplace_items FOR INSERT
  WITH CHECK (
    ((auth.uid() IS NULL) AND (user_id IS NULL))
    OR ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()))
  );

CREATE POLICY "Owner can update their marketplace item"
  ON public.marketplace_items FOR UPDATE
  USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE POLICY "Owner can delete their marketplace item"
  ON public.marketplace_items FOR DELETE
  USING ((auth.uid() IS NOT NULL) AND (user_id = auth.uid()));

CREATE TRIGGER set_marketplace_items_updated_at
  BEFORE UPDATE ON public.marketplace_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Marketplace images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketplace-images');

CREATE POLICY "Anyone can upload marketplace images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'marketplace-images');
