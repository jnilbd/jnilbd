
-- 1) Marketplace: hide contact_phone from anon, keep visible to authenticated
REVOKE SELECT ON public.marketplace_items FROM anon;
GRANT SELECT (id, title, description, price, category, condition, location, contact_name, images, created_at, updated_at, user_id)
  ON public.marketplace_items TO anon;

-- 2) Rentals: hide contact_phone from anon, keep visible to authenticated
REVOKE SELECT ON public.rentals FROM anon;
GRANT SELECT (id, title, description, price, type, bedrooms, bathrooms, size, location, contact_name, images, created_at, updated_at, user_id)
  ON public.rentals TO anon;

-- 3) train_alert_notifications: restrict insert to service_role only
DROP POLICY IF EXISTS "Service role inserts notifications" ON public.train_alert_notifications;
CREATE POLICY "Service role inserts notifications"
  ON public.train_alert_notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);
