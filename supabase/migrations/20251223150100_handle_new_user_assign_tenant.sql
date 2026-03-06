-- When a new user is created (signup from invite), set profile.tenant_id from pending invitation
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _tenant_id uuid;
BEGIN
  -- Get tenant_id from pending invitation for this email (if any)
  SELECT tenant_id INTO _tenant_id
  FROM public.invitations
  WHERE email = new.email AND status = 'pending'
  LIMIT 1;

  INSERT INTO public.profiles (id, email, last_sign_in_at, tenant_id)
  VALUES (new.id, new.email, new.last_sign_in_at, _tenant_id);

  -- Auto-assign admin role to specific email
  IF new.email = 'neven@test.ai' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$;
