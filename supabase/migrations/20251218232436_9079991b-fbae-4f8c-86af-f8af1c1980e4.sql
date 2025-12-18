-- Update handle_new_user function to remove neven@test.ai from auto-admin list
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, last_sign_in_at)
  VALUES (new.id, new.email, new.last_sign_in_at);
  
  -- Auto-assign admin role to specific emails
  IF new.email IN ('mulavdic.neven2001@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$function$;