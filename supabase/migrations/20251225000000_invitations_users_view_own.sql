-- Allow users to read their own invitation (by email) so the app can redirect
-- them to set password when they sign in via invite link.
CREATE POLICY "Users can view their own invitation"
ON public.invitations
FOR SELECT
USING (lower(email) = lower(((select auth.jwt()) ->> 'email'::text)));
