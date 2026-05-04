
-- Rentals table
CREATE TABLE public.rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Apartment',
  price INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  size INTEGER NOT NULL DEFAULT 0,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX rentals_created_at_idx ON public.rentals (created_at DESC);
CREATE INDEX rentals_user_id_idx ON public.rentals (user_id);

ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- Anyone can view rentals
CREATE POLICY "Anyone can view rentals"
  ON public.rentals FOR SELECT
  USING (true);

-- Anyone (even anonymous) can post a rental
CREATE POLICY "Anyone can create a rental"
  ON public.rentals FOR INSERT
  WITH CHECK (
    -- If logged in, user_id must match auth.uid(); if anonymous, user_id must be null
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Only owner can update their own rental
CREATE POLICY "Owner can update their rental"
  ON public.rentals FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Only owner can delete their own rental
CREATE POLICY "Owner can delete their rental"
  ON public.rentals FOR DELETE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER rentals_set_updated_at
  BEFORE UPDATE ON public.rentals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for rental images
INSERT INTO storage.buckets (id, name, public)
VALUES ('rental-images', 'rental-images', true);

-- Storage policies
CREATE POLICY "Anyone can view rental images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'rental-images');

CREATE POLICY "Anyone can upload rental images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'rental-images');
