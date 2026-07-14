
-- Fix insecure INSERT policies on orders tables
DROP POLICY IF EXISTS "Anyone can place orders" ON public.shop_orders;
CREATE POLICY "Anyone can place orders"
ON public.shop_orders
FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone places service orders" ON public.service_orders;
CREATE POLICY "Anyone places service orders"
ON public.service_orders
FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Restrict has_role SECURITY DEFINER to authenticated users only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
