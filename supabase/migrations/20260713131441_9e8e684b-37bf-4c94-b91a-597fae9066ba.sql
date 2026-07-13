
CREATE TABLE public.owned_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  identity TEXT,
  category TEXT,
  condition TEXT NOT NULL DEFAULT 'good',
  source_name TEXT,
  source_phone TEXT,
  acquired_at TIMESTAMPTZ,
  acquire_cost NUMERIC NOT NULL DEFAULT 0,
  issue_description TEXT,
  repair_needed BOOLEAN NOT NULL DEFAULT false,
  repair_details TEXT,
  estimated_repair_cost NUMERIC NOT NULL DEFAULT 0,
  actual_repair_cost NUMERIC NOT NULL DEFAULT 0,
  repaired_at TIMESTAMPTZ,
  expected_value NUMERIC NOT NULL DEFAULT 0,
  sold_price NUMERIC NOT NULL DEFAULT 0,
  sold_at TIMESTAMPTZ,
  buyer_name TEXT,
  buyer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'owned',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.owned_assets TO authenticated;
GRANT ALL ON public.owned_assets TO service_role;
ALTER TABLE public.owned_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assets" ON public.owned_assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER owned_assets_updated_at BEFORE UPDATE ON public.owned_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX owned_assets_user_idx ON public.owned_assets(user_id, created_at DESC);
