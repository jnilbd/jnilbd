
REVOKE ALL ON FUNCTION public.inventory_apply_mv() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.inventory_apply_mv() TO service_role;
