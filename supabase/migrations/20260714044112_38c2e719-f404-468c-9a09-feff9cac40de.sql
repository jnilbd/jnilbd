
CREATE TABLE public.finance_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID REFERENCES public.finance_wallets(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  fee NUMERIC NOT NULL DEFAULT 0,
  method TEXT,
  note TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_withdrawals TO authenticated;
GRANT ALL ON public.finance_withdrawals TO service_role;
ALTER TABLE public.finance_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own withdrawals select" ON public.finance_withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own withdrawals insert" ON public.finance_withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own withdrawals update" ON public.finance_withdrawals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own withdrawals delete" ON public.finance_withdrawals FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_finance_withdrawals_user_date ON public.finance_withdrawals(user_id, occurred_at DESC);
CREATE INDEX idx_finance_withdrawals_wallet ON public.finance_withdrawals(wallet_id);
