REVOKE SELECT, INSERT, UPDATE ON public.train_alert_subscribers FROM anon;
REVOKE SELECT, INSERT ON public.train_alert_notifications FROM anon;

DROP POLICY IF EXISTS "Anyone can subscribe to train alerts" ON public.train_alert_subscribers;
CREATE POLICY "Authenticated users can create their own train alerts"
  ON public.train_alert_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Service role inserts notifications" ON public.train_alert_notifications;