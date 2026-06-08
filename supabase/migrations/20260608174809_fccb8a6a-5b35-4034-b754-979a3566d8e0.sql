
CREATE TABLE public.planned_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  est_price NUMERIC NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium',
  plan_date DATE,
  is_done BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planned_purchases TO authenticated;
GRANT ALL ON public.planned_purchases TO service_role;
ALTER TABLE public.planned_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own planned select" ON public.planned_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own planned insert" ON public.planned_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own planned update" ON public.planned_purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own planned delete" ON public.planned_purchases FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER planned_purchases_updated BEFORE UPDATE ON public.planned_purchases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sellable_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  est_value NUMERIC NOT NULL DEFAULT 0,
  condition TEXT NOT NULL DEFAULT 'good',
  is_sold BOOLEAN NOT NULL DEFAULT false,
  sold_amount NUMERIC,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellable_assets TO authenticated;
GRANT ALL ON public.sellable_assets TO service_role;
ALTER TABLE public.sellable_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assets select" ON public.sellable_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own assets insert" ON public.sellable_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own assets update" ON public.sellable_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own assets delete" ON public.sellable_assets FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER sellable_assets_updated BEFORE UPDATE ON public.sellable_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
