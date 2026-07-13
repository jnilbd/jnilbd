GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT SELECT ON public.shop_products TO anon;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.shop_products;
CREATE POLICY "Anyone can view active products" ON public.shop_products FOR SELECT TO anon, authenticated USING (is_active = true);