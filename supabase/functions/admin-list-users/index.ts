import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

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
    console.log('Admin list users function called');

    // Initialize Supabase clients
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from JWT token
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.log('Invalid user token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Check if user has super_admin role using service role client
    const { data: userRoles, error: roleError } = await supabaseServiceRole
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.log('Error checking user roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to check user permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasAdminRole = userRoles?.some(r => r.role === 'super_admin' || r.role === 'company_admin');
    if (!hasAdminRole) {
      console.log('User does not have admin role');
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User has admin permissions, fetching data...');

    // Fetch all required data using service role client
    const [companiesResult, divisionsResult, workspacesResult, profilesResult, userRolesResult, workspaceMembersResult] = await Promise.all([
      supabaseServiceRole.from('companies').select('*'),
      supabaseServiceRole.from('divisions').select('*'),
      supabaseServiceRole.from('workspaces').select('*'),
      supabaseServiceRole.from('profiles').select('*'),
      supabaseServiceRole.from('user_roles').select('*'),
      supabaseServiceRole.from('workspace_members').select('*')
    ]);

    // Check for errors
    if (companiesResult.error) {
      console.log('Error fetching companies:', companiesResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch companies' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (divisionsResult.error) {
      console.log('Error fetching divisions:', divisionsResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch divisions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (workspacesResult.error) {
      console.log('Error fetching workspaces:', workspacesResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workspaces' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profilesResult.error) {
      console.log('Error fetching profiles:', profilesResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profiles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userRolesResult.error) {
      console.log('Error fetching user roles:', userRolesResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user roles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (workspaceMembersResult.error) {
      console.log('Error fetching workspace members:', workspaceMembersResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workspace members' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('All data fetched successfully');
    console.log('Companies:', companiesResult.data?.length);
    console.log('Divisions:', divisionsResult.data?.length);
    console.log('Workspaces:', workspacesResult.data?.length);
    console.log('Profiles:', profilesResult.data?.length);
    console.log('User roles:', userRolesResult.data?.length);
    console.log('Workspace members:', workspaceMembersResult.data?.length);

    // Return all data
    return new Response(
      JSON.stringify({
        companies: companiesResult.data || [],
        divisions: divisionsResult.data || [],
        workspaces: workspacesResult.data || [],
        profiles: profilesResult.data || [],
        userRoles: userRolesResult.data || [],
        workspaceMembers: workspaceMembersResult.data || []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});