
-- Finance module Phase 1: wallets + transactions
CREATE TABLE public.finance_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'cash', -- cash | bank | mobile | card | digital
  provider text, -- bkash | nagad | rocket | upay | visa | ...
  scope text NOT NULL DEFAULT 'personal', -- personal | business
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BDT',
  icon text,
  color text,
  is_default boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_wallets TO authenticated;
GRANT ALL ON public.finance_wallets TO service_role;
ALTER TABLE public.finance_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wallets" ON public.finance_wallets FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_finance_wallets_updated BEFORE UPDATE ON public.finance_wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.finance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id uuid REFERENCES public.finance_wallets(id) ON DELETE SET NULL,
  transfer_to_wallet_id uuid REFERENCES public.finance_wallets(id) ON DELETE SET NULL,
  type text NOT NULL, -- income | expense | transfer | sale | purchase | loan_given | loan_taken | repayment_in | repayment_out | stock_in | stock_out | return_in | return_out
  amount numeric NOT NULL,
  category text,
  subcategory text,
  scope text NOT NULL DEFAULT 'personal', -- personal | business
  party text,
  note text,
  product_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_transactions TO authenticated;
GRANT ALL ON public.finance_transactions TO service_role;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tx" ON public.finance_transactions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_finance_tx_user_time ON public.finance_transactions(user_id, occurred_at DESC);
CREATE INDEX idx_finance_tx_wallet ON public.finance_transactions(wallet_id);
CREATE TRIGGER trg_finance_tx_updated BEFORE UPDATE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Wallet balance auto-adjust trigger
CREATE OR REPLACE FUNCTION public.finance_apply_tx()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  sign_from numeric := 0;
  sign_to numeric := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- determine sign for wallet_id
    IF NEW.type IN ('income','sale','loan_taken','repayment_in','return_in','stock_in') THEN
      sign_from := NEW.amount;
    ELSIF NEW.type IN ('expense','purchase','loan_given','repayment_out','return_out','stock_out') THEN
      sign_from := -NEW.amount;
    ELSIF NEW.type = 'transfer' THEN
      sign_from := -NEW.amount;
      sign_to := NEW.amount;
    END IF;
    IF NEW.wallet_id IS NOT NULL AND sign_from <> 0 THEN
      UPDATE public.finance_wallets SET balance = balance + sign_from WHERE id = NEW.wallet_id;
    END IF;
    IF NEW.transfer_to_wallet_id IS NOT NULL AND sign_to <> 0 THEN
      UPDATE public.finance_wallets SET balance = balance + sign_to WHERE id = NEW.transfer_to_wallet_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type IN ('income','sale','loan_taken','repayment_in','return_in','stock_in') THEN
      sign_from := -OLD.amount;
    ELSIF OLD.type IN ('expense','purchase','loan_given','repayment_out','return_out','stock_out') THEN
      sign_from := OLD.amount;
    ELSIF OLD.type = 'transfer' THEN
      sign_from := OLD.amount;
      sign_to := -OLD.amount;
    END IF;
    IF OLD.wallet_id IS NOT NULL AND sign_from <> 0 THEN
      UPDATE public.finance_wallets SET balance = balance + sign_from WHERE id = OLD.wallet_id;
    END IF;
    IF OLD.transfer_to_wallet_id IS NOT NULL AND sign_to <> 0 THEN
      UPDATE public.finance_wallets SET balance = balance + sign_to WHERE id = OLD.transfer_to_wallet_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_finance_apply_tx
  AFTER INSERT OR DELETE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION public.finance_apply_tx();
