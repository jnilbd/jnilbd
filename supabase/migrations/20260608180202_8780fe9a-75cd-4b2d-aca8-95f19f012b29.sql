
-- 1. train_alert_subscribers: restrict SELECT/UPDATE to authenticated owner only
DROP POLICY IF EXISTS "Anyone can view their own subscriptions by phone" ON public.train_alert_subscribers;
DROP POLICY IF EXISTS "Anyone can update (unsubscribe) by phone" ON public.train_alert_subscribers;

CREATE POLICY "Owner can view their train subscriptions"
  ON public.train_alert_subscribers FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Owner can update their train subscriptions"
  ON public.train_alert_subscribers FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Owner can delete their train subscriptions"
  ON public.train_alert_subscribers FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 2. train_alert_notifications: restrict SELECT to authenticated subscriber owner
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.train_alert_notifications;

CREATE POLICY "Owner can view their train notifications"
  ON public.train_alert_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.train_alert_subscribers s
      WHERE s.id = subscriber_id AND s.user_id = auth.uid()
    )
  );

-- Unpublish from realtime so anonymous subscribers don't leak via channels
ALTER PUBLICATION supabase_realtime DROP TABLE public.train_alert_notifications;

-- 3. weather_alert_subscribers: remove overly permissive UPDATE; rely on edge functions (service role)
DROP POLICY IF EXISTS "Anyone can unsubscribe by phone" ON public.weather_alert_subscribers;

-- 4. service_requests: add UPDATE/DELETE for authenticated owners
CREATE POLICY "Owner can update their service requests"
  ON public.service_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Owner can delete their service requests"
  ON public.service_requests FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 5. Storage: add UPDATE/DELETE policies scoped to uploader (owner column)
CREATE POLICY "Owners can update their marketplace images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'marketplace-images' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'marketplace-images' AND owner = auth.uid());

CREATE POLICY "Owners can delete their marketplace images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'marketplace-images' AND owner = auth.uid());

CREATE POLICY "Owners can update their rental images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'rental-images' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'rental-images' AND owner = auth.uid());

CREATE POLICY "Owners can delete their rental images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'rental-images' AND owner = auth.uid());
