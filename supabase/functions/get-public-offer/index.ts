import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch offer by share_token
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('share_token', token)
      .single();

    if (offerError || !offer) {
      console.error('Offer not found:', offerError);
      return new Response(
        JSON.stringify({ error: 'Offer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle accept/reject actions
    if (action === 'accept' || action === 'reject') {
      const { error: updateError } = await supabase
        .from('offers')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'rejected',
          accepted_at: action === 'accept' ? new Date().toISOString() : null
        })
        .eq('share_token', token);

      if (updateError) {
        console.error('Failed to update offer status:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update offer status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch updated offer
      const { data: updatedOffer } = await supabase
        .from('offers')
        .select('*')
        .eq('share_token', token)
        .single();

      offer.status = updatedOffer?.status;
      offer.accepted_at = updatedOffer?.accepted_at;
    }

    // Fetch offer items
    const { data: items, error: itemsError } = await supabase
      .from('offer_items')
      .select('*')
      .eq('offer_id', offer.id);

    if (itemsError) {
      console.error('Failed to fetch offer items:', itemsError);
    }

    // Fetch offer item groups
    const { data: groups, error: groupsError } = await supabase
      .from('offer_item_groups')
      .select('*')
      .eq('offer_id', offer.id)
      .order('redni_broj');

    if (groupsError) {
      console.error('Failed to fetch offer groups:', groupsError);
    }

    // Fetch company profile
    const { data: company, error: companyError } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', offer.user_id)
      .single();

    if (companyError) {
      console.error('Failed to fetch company profile:', companyError);
    }

    console.log('Successfully fetched offer:', offer.id);

    return new Response(
      JSON.stringify({ 
        offer, 
        items: items || [], 
        groups: groups || [],
        company: company || null 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-public-offer:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
