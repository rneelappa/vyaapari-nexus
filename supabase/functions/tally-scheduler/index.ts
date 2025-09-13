import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('tally-scheduler function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all divisions with auto sync enabled
    const { data: divisions, error: divisionsError } = await supabase
      .from('divisions')
      .select(`
        id, 
        company_id, 
        name, 
        auto_sync_enabled, 
        sync_frequency, 
        last_sync_attempt, 
        last_sync_success,
        sync_status,
        tally_enabled,
        tally_url,
        tally_company_id
      `)
      .eq('auto_sync_enabled', true)
      .eq('tally_enabled', true)
      .neq('sync_frequency', 'disabled');

    if (divisionsError) {
      console.error('Error fetching divisions:', divisionsError);
      return new Response(JSON.stringify({ error: divisionsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${divisions?.length || 0} divisions with auto sync enabled`);

    const results = [];
    const now = new Date();

    for (const division of divisions || []) {
      try {
        // Check if sync is due based on frequency
        const isDue = isSyncDue(division.last_sync_attempt, division.sync_frequency, now);
        
        if (!isDue) {
          console.log(`Sync not due for division ${division.name} (${division.sync_frequency})`);
          continue;
        }

        console.log(`Starting sync for division ${division.name}`);

        // Update sync status to 'running'
        await supabase
          .from('divisions')
          .update({ 
            sync_status: 'running', 
            last_sync_attempt: now.toISOString() 
          })
          .eq('id', division.id);

        // Create sync job record
        const { data: job } = await supabase
          .from('tally_sync_jobs')
          .insert({
            division_id: division.id,
            company_id: division.company_id,
            job_type: 'scheduled',
            status: 'running'
          })
          .select()
          .single();

        // Calculate date range for sync (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Call the get-recent-vouchers function to fetch and sync data
        const syncResult = await supabase.functions.invoke('get-recent-vouchers', {
          body: {
            divisionId: division.id,
            fromDate: startDate.toISOString().split('T')[0],
            toDate: endDate.toISOString().split('T')[0]
          }
        });

        if (syncResult.error) {
          throw new Error(syncResult.error.message);
        }

        const recordsProcessed = syncResult.data?.voucherCount || 0;

        // Update job status to completed
        await supabase
          .from('tally_sync_jobs')
          .update({
            status: 'completed',
            completed_at: now.toISOString(),
            records_processed: recordsProcessed
          })
          .eq('id', job.id);

        // Update division sync status
        await supabase
          .from('divisions')
          .update({ 
            sync_status: 'completed',
            last_sync_success: now.toISOString()
          })
          .eq('id', division.id);

        results.push({
          division_id: division.id,
          division_name: division.name,
          status: 'success',
          records_processed: recordsProcessed
        });

        console.log(`Sync completed for division ${division.name}: ${recordsProcessed} records processed`);

      } catch (error) {
        console.error(`Error syncing division ${division.name}:`, error);

        // Update job status to failed
        if (job?.id) {
          await supabase
            .from('tally_sync_jobs')
            .update({
              status: 'failed',
              completed_at: now.toISOString(),
              error_message: error.message
            })
            .eq('id', job.id);
        }

        // Update division sync status
        await supabase
          .from('divisions')
          .update({ sync_status: 'failed' })
          .eq('id', division.id);

        results.push({
          division_id: division.id,
          division_name: division.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed_divisions: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in tally-scheduler:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

function isSyncDue(lastSyncAttempt: string | null, frequency: string, now: Date): boolean {
  if (!lastSyncAttempt) return true; // Never synced before

  const lastSync = new Date(lastSyncAttempt);
  const timeDiff = now.getTime() - lastSync.getTime();
  const minutesDiff = timeDiff / (1000 * 60);

  switch (frequency) {
    case '1min':
      return minutesDiff >= 1;
    case '5min':
      return minutesDiff >= 5;
    case '15min':
      return minutesDiff >= 15;
    case '30min':
      return minutesDiff >= 30;
    case '1hour':
      return minutesDiff >= 60;
    case '3hours':
      return minutesDiff >= 180;
    case '6hours':
      return minutesDiff >= 360;
    case '12hours':
      return minutesDiff >= 720;
    case '24hours':
      return minutesDiff >= 1440;
    case 'weekly':
      return minutesDiff >= 10080; // 7 * 24 * 60
    case 'monthly':
      return minutesDiff >= 43200; // 30 * 24 * 60
    default:
      return false;
  }
}