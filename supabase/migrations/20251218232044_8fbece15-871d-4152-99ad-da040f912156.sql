-- Allow admins to delete invitations
CREATE POLICY "Admins can delete invitations" 
ON public.invitations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));