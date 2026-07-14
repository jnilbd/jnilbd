
ALTER TABLE public.debts DROP CONSTRAINT IF EXISTS debts_direction_check;
ALTER TABLE public.debts
  ADD CONSTRAINT debts_direction_check
  CHECK (direction IN ('owed_to_me','i_owe','lent','borrowed'));
