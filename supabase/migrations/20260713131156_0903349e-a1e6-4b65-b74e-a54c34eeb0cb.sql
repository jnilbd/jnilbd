
CREATE TABLE public.service_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'repair',
  service_kind TEXT,
  item_name TEXT NOT NULL,
  item_identity TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  promised_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  charge_amount NUMERIC NOT NULL DEFAULT 0,
  cost_amount NUMERIC NOT NULL DEFAULT 0,
  advance_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'received',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_jobs TO authenticated;
GRANT ALL ON public.service_jobs TO service_role;

ALTER TABLE public.service_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own service_jobs"
  ON public.service_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_service_jobs_updated_at
  BEFORE UPDATE ON public.service_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_service_jobs_user_received ON public.service_jobs(user_id, received_at DESC);
