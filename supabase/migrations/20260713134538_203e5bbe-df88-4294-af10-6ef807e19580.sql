ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'physical' CHECK (product_type IN ('digital','physical'));
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS digital_delivery_info text;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'physical';
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS payment_proof text;
ALTER TABLE public.shop_orders ADD COLUMN IF NOT EXISTS payment_txn_id text;