-- Revoke public/anon EXECUTE on SECURITY DEFINER functions exposed via PostgREST RPC.
-- Trigger-only functions should not be callable from the API at all.
-- Note: REVOKE FROM anon is insufficient when PUBLIC has EXECUTE; revoke PUBLIC first.

REVOKE EXECUTE ON FUNCTION public.get_offer_counts_for_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_offer_counts_for_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_user_login() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_tenant_id_from_offer() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_tenant_id_from_user() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) TO authenticated;
