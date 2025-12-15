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

    // Get the email from the request body
    const { email } = await req.json();
    if (!email || !email.trim()) {
      throw new Error('Email adresa je obavezna');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email?.toLowerCase() === normalizedEmail);
    
    if (userExists) {
      throw new Error('Korisnik s tom email adresom već postoji');
    }

    // Check if already invited
    const { data: existingInvitation } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existingInvitation) {
      throw new Error('Pozivnica za tu email adresu već postoji');
    }

    // Send the invitation using Supabase's built-in invite
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail);

    if (inviteError) {
      console.error('Invite error:', inviteError);
      throw new Error('Greška pri slanju pozivnice: ' + inviteError.message);
    }

    console.log('Invitation sent successfully to:', normalizedEmail);

    // Save the invitation to our invitations table
    const { error: insertError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email: normalizedEmail,
        invited_by: user.id,
        status: 'pending'
      });

    if (insertError) {
      console.error('Error saving invitation:', insertError);
      // Don't throw here - the invite was sent successfully
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
