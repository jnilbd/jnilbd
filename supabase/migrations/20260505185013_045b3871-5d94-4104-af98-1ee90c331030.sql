-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  monthly_income INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- TRANSACTIONS (income / expense)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  note TEXT,
  occurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_select_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tx_insert_own" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tx_update_own" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tx_delete_own" ON public.transactions FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_tx_user_date ON public.transactions(user_id, occurred_on DESC);

-- DEBTS (loans given/taken)
CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('lent','borrowed')),
  counterparty TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  paid_amount INTEGER NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  due_date DATE,
  note TEXT,
  is_settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debt_select_own" ON public.debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "debt_insert_own" ON public.debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "debt_update_own" ON public.debts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "debt_delete_own" ON public.debts FOR DELETE USING (auth.uid() = user_id);

-- BUDGETS (monthly per category)
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  monthly_limit INTEGER NOT NULL CHECK (monthly_limit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budget_select_own" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "budget_insert_own" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "budget_update_own" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "budget_delete_own" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- SAVINGS GOALS
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount INTEGER NOT NULL CHECK (target_amount >= 0),
  saved_amount INTEGER NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goal_select_own" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goal_insert_own" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goal_update_own" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goal_delete_own" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

-- updated_at triggers (reuse existing set_updated_at)
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tx_updated BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_debts_updated BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_budgets_updated BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_goals_updated BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();