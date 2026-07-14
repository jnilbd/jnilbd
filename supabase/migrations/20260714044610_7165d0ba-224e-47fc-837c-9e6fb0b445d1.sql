
CREATE TABLE public.finance_recurring_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  wallet_id UUID REFERENCES public.finance_wallets(id) ON DELETE SET NULL,
  scope TEXT NOT NULL DEFAULT 'personal',
  due_day INTEGER NOT NULL DEFAULT 1 CHECK (due_day BETWEEN 1 AND 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  last_paid_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_recurring_bills TO authenticated;
GRANT ALL ON public.finance_recurring_bills TO service_role;

ALTER TABLE public.finance_recurring_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recurring bills"
  ON public.finance_recurring_bills FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_finance_recurring_bills_updated
  BEFORE UPDATE ON public.finance_recurring_bills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_finance_recurring_bills_user ON public.finance_recurring_bills(user_id, is_active, due_day);
