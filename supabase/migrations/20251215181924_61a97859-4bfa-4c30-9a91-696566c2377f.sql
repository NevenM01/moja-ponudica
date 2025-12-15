-- Add admin role for existing user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE email = 'mulavdic.neven2001@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update trigger to also auto-assign admin to this email
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
  IF new.email IN ('neven@test.ai', 'mulavdic.neven2001@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$function$;