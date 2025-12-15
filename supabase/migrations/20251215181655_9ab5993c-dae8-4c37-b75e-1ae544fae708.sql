-- Update handle_new_user trigger to NOT automatically accept invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, last_sign_in_at)
  VALUES (new.id, new.email, new.last_sign_in_at);
  
  -- Auto-assign admin role to specific email
  IF new.email = 'neven@test.ai' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- REMOVED: automatic invitation status update
  -- Status will only be updated when user sets password via SetPassword.tsx
  
  RETURN new;
END;
$function$;

-- Reset test invitation to pending
UPDATE public.invitations 
SET status = 'pending', accepted_at = NULL 
WHERE email = 'mulavdic.neven2001@gmail.com';