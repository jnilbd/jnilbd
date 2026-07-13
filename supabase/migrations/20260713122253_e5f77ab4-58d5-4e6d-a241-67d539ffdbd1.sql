
-- 1) Products
CREATE TABLE public.inventory_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  sku text,
  unit text NOT NULL DEFAULT 'pcs',
  purchase_price numeric NOT NULL DEFAULT 0,
  sell_price numeric NOT NULL DEFAULT 0,
  current_stock numeric NOT NULL DEFAULT 0,
  low_stock_threshold numeric NOT NULL DEFAULT 5,
  scope text NOT NULL DEFAULT 'business',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_products TO authenticated;
GRANT ALL ON public.inventory_products TO service_role;

ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own products select" ON public.inventory_products FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own products insert" ON public.inventory_products FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own products update" ON public.inventory_products FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own products delete" ON public.inventory_products FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_products_updated
BEFORE UPDATE ON public.inventory_products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) Movements
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('stock_in','stock_out','customer_return','supplier_return','damage','sale')),
  qty numeric NOT NULL CHECK (qty > 0),
  unit_price numeric NOT NULL DEFAULT 0,
  note text,
  related_tx_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own mv select" ON public.inventory_movements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own mv insert" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own mv update" ON public.inventory_movements FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own mv delete" ON public.inventory_movements FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_inv_mv_product ON public.inventory_movements(product_id, occurred_at DESC);

-- 3) Trigger to auto-adjust product stock
CREATE OR REPLACE FUNCTION public.inventory_apply_mv()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  delta numeric := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type IN ('stock_in','customer_return') THEN delta := NEW.qty;
    ELSIF NEW.type IN ('stock_out','supplier_return','damage','sale') THEN delta := -NEW.qty;
    END IF;
    UPDATE public.inventory_products SET current_stock = current_stock + delta WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type IN ('stock_in','customer_return') THEN delta := -OLD.qty;
    ELSIF OLD.type IN ('stock_out','supplier_return','damage','sale') THEN delta := OLD.qty;
    END IF;
    UPDATE public.inventory_products SET current_stock = current_stock + delta WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_inventory_apply
AFTER INSERT OR DELETE ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION public.inventory_apply_mv();
