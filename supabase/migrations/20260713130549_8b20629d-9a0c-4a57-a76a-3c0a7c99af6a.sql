
CREATE TABLE IF NOT EXISTS public.finance_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_no TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  product_id UUID REFERENCES public.inventory_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  courier_charge NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  courier_name TEXT,
  tracking_id TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  return_reason TEXT,
  notes TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_sales TO authenticated;
GRANT ALL ON public.finance_sales TO service_role;

ALTER TABLE public.finance_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own sales select" ON public.finance_sales FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sales insert" ON public.finance_sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sales update" ON public.finance_sales FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sales delete" ON public.finance_sales FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_finance_sales_updated_at BEFORE UPDATE ON public.finance_sales
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS finance_sales_user_time_idx ON public.finance_sales(user_id, occurred_at DESC);
