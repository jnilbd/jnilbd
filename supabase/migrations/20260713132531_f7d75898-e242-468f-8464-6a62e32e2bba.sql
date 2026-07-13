
ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS party_name text,
  ADD COLUMN IF NOT EXISTS party_phone text,
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS tracking_no text,
  ADD COLUMN IF NOT EXISTS amount_paid numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed';

COMMENT ON COLUMN public.inventory_movements.location IS 'office | courier | with_person | supplier | customer | damaged';
COMMENT ON COLUMN public.inventory_movements.status IS 'completed | in_transit | pending | returned | cancelled';

CREATE INDEX IF NOT EXISTS idx_inv_mv_location ON public.inventory_movements(location);
CREATE INDEX IF NOT EXISTS idx_inv_mv_status ON public.inventory_movements(status);
