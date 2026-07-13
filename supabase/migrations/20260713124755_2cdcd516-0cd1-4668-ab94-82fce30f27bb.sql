
CREATE TABLE public.debt_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.debt_payments TO authenticated;
GRANT ALL ON public.debt_payments TO service_role;

ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their debt payments"
  ON public.debt_payments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_debt_payments_debt ON public.debt_payments(debt_id, paid_at DESC);

-- Trigger: recompute debts.paid_amount and is_settled after any payment change
CREATE OR REPLACE FUNCTION public.recalc_debt_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_debt UUID;
  total NUMERIC;
  debt_amount NUMERIC;
BEGIN
  target_debt := COALESCE(NEW.debt_id, OLD.debt_id);
  SELECT COALESCE(SUM(amount), 0) INTO total FROM public.debt_payments WHERE debt_id = target_debt;
  SELECT amount INTO debt_amount FROM public.debts WHERE id = target_debt;
  UPDATE public.debts
    SET paid_amount = total,
        is_settled = (total >= COALESCE(debt_amount, 0) AND COALESCE(debt_amount, 0) > 0)
    WHERE id = target_debt;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_debt_payments_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.debt_payments
FOR EACH ROW EXECUTE FUNCTION public.recalc_debt_totals();
