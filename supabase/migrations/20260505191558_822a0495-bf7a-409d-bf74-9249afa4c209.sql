CREATE TABLE public.vault_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'note',
  encrypted_data text NOT NULL,
  iv text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY vault_select_own ON public.vault_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY vault_insert_own ON public.vault_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY vault_update_own ON public.vault_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY vault_delete_own ON public.vault_items FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER vault_updated_at BEFORE UPDATE ON public.vault_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();