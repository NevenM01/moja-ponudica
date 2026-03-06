import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get the authorization header to verify the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Nedostaje autorizacija');
    }

    // Create client with the user's JWT to verify they're an admin
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error('Neautoriziran pristup');
    }

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseUser.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      throw new Error('Samo administratori mogu slati pozivnice');
    }

    // Get the email, resend flag and optional tenant_id from the request body
    const { email, resend, tenant_id: tenantId } = await req.json();
    if (!email || !email.trim()) {
      throw new Error('Email adresa je obavezna');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

    // For resend requests - delete existing user and proceed
    if (resend) {
      if (existingUser) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
        if (deleteError) {
          console.error('Error deleting existing user for resend:', deleteError);
          throw new Error('Greška pri ponovnom slanju pozivnice');
        }
      }
    } else {
      // For new invitations - check if user already confirmed
      if (existingUser && existingUser.email_confirmed_at) {
        throw new Error('Korisnik s tom email adresom već postoji');
      }

      // Check for existing pending invitation only (ignore accepted/expired)
      const { data: existingInvitation } = await supabaseAdmin
        .from('invitations')
        .select('id')
        .eq('email', normalizedEmail)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvitation) {
        throw new Error('Pozivnica za tu email adresu već postoji');
      }
    }

    // Send the invitation using Supabase's built-in invite
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail);

    if (inviteError) {
      console.error('Invite error:', inviteError);
      throw new Error('Greška pri slanju pozivnice: ' + inviteError.message);
    }

    console.log('Invitation sent successfully to:', normalizedEmail, resend ? '(resend)' : '');

    // Save or update the invitation in our invitations table
    if (!resend) {
      const { error: insertError } = await supabaseAdmin
        .from('invitations')
        .insert({
          email: normalizedEmail,
          invited_by: user.id,
          status: 'pending',
          ...(tenantId && { tenant_id: tenantId }),
        });

      if (insertError) {
        console.error('Error saving invitation:', insertError);
      }
    } else if (tenantId) {
      // On resend, update tenant_id on existing pending invitation if provided
      await supabaseAdmin
        .from('invitations')
        .update({ tenant_id: tenantId })
        .eq('email', normalizedEmail)
        .eq('status', 'pending');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Pozivnica uspješno poslana',
        userId: inviteData?.user?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in invite-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
