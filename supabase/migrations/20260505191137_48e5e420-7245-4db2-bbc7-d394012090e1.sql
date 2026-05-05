CREATE TABLE public.scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipient_name text NOT NULL,
  recipient_phone text NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp',
  message text NOT NULL,
  send_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY sm_select_own ON public.scheduled_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY sm_insert_own ON public.scheduled_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY sm_update_own ON public.scheduled_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY sm_delete_own ON public.scheduled_messages FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER sm_updated_at BEFORE UPDATE ON public.scheduled_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_sm_pending ON public.scheduled_messages (send_at) WHERE status = 'pending';