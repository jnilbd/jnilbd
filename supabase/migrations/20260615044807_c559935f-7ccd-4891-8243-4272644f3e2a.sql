
-- 1. Hide contact_phone from anonymous users on marketplace_items
REVOKE SELECT ON public.marketplace_items FROM anon;
GRANT SELECT (id, user_id, title, description, category, condition, price, location, contact_name, images, created_at, updated_at) ON public.marketplace_items TO anon;

-- 2. Same on rentals
REVOKE SELECT ON public.rentals FROM anon;
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ')
    INTO cols
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='rentals' AND column_name <> 'contact_phone';
  EXECUTE format('GRANT SELECT (%s) ON public.rentals TO anon', cols);
END $$;

-- 3. Restrict SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 4. Explicit restrictive policies blocking non-service_role inserts on user_roles
CREATE POLICY "Only service role can insert user roles"
  ON public.user_roles FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "Only service role can update user roles"
  ON public.user_roles FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "Only service role can delete user roles"
  ON public.user_roles FOR DELETE TO authenticated, anon USING (false);

-- 5. Explicit block on direct inserts to train_alert_notifications
CREATE POLICY "Only service role can insert train notifications"
  ON public.train_alert_notifications FOR INSERT TO authenticated, anon WITH CHECK (false);
