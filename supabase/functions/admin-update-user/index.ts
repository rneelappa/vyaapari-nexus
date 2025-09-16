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
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user has admin privileges
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a client to verify the user's role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User verification error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabaseServiceRole
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'company_admin']);

    if (roleError || !userRoles || userRoles.length === 0) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { 
      userId, 
      selectedRole, 
      selectedCompanies, 
      selectedDivisions, 
      selectedWorkspaces 
    } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Start transaction-like operations
    console.log(`Updating assignments for user: ${userId}`);

    // Remove existing roles
    const { error: deleteRoleError } = await supabaseServiceRole
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteRoleError) {
      console.error('Error deleting existing roles:', deleteRoleError);
      return new Response(
        JSON.stringify({ error: `Failed to delete existing roles: ${deleteRoleError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Add new roles
    const newRoles = [];

    // Add global role
    if (selectedRole) {
      newRoles.push({
        user_id: userId,
        role: selectedRole
      });
    }

    // Add company-specific roles
    if (selectedCompanies && selectedCompanies.length > 0) {
      for (const companyId of selectedCompanies) {
        newRoles.push({
          user_id: userId,
          role: 'company_admin',
          company_id: companyId
        });
      }
    }

    // Add division-specific roles
    if (selectedDivisions && selectedDivisions.length > 0) {
      for (const divisionId of selectedDivisions) {
        newRoles.push({
          user_id: userId,
          role: 'division_admin',
          division_id: divisionId
        });
      }
    }

    if (newRoles.length > 0) {
      const { error: insertRoleError } = await supabaseServiceRole
        .from('user_roles')
        .insert(newRoles);

      if (insertRoleError) {
        console.error('Error inserting new roles:', insertRoleError);
        return new Response(
          JSON.stringify({ error: `Failed to insert new roles: ${insertRoleError.message}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Remove existing workspace memberships
    const { error: deleteWsError } = await supabaseServiceRole
      .from('workspace_members')
      .delete()
      .eq('user_id', userId);

    if (deleteWsError) {
      console.error('Error deleting workspace memberships:', deleteWsError);
      return new Response(
        JSON.stringify({ error: `Failed to delete workspace memberships: ${deleteWsError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Add new workspace memberships
    if (selectedWorkspaces && selectedWorkspaces.length > 0) {
      const workspaceMemberships = selectedWorkspaces.map((workspaceId: string) => ({
        user_id: userId,
        workspace_id: workspaceId,
        role: 'admin'
      }));

      const { error: insertWsError } = await supabaseServiceRole
        .from('workspace_members')
        .insert(workspaceMemberships);

      if (insertWsError) {
        console.error('Error inserting workspace memberships:', insertWsError);
        return new Response(
          JSON.stringify({ error: `Failed to insert workspace memberships: ${insertWsError.message}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    console.log(`Successfully updated assignments for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User assignments updated successfully'
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
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});