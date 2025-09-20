import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Division {
  id: string
  tally_url: string | null
  tally_enabled: boolean | null
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting Tally health check for all divisions...')

    // Get all divisions with Tally enabled
    const { data: divisions, error: divisionsError } = await supabase
      .from('divisions')
      .select('id, tally_url, tally_enabled')
      .eq('tally_enabled', true)
      .not('tally_url', 'is', null)

    if (divisionsError) {
      console.error('Error fetching divisions:', divisionsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch divisions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Found ${divisions?.length || 0} divisions with Tally enabled`)

    const healthCheckResults = []

    // Check health for each division
    for (const division of divisions || []) {
      const startTime = Date.now()
      let healthStatus = 'offline'
      let responseTime = null
      let errorMessage = null

      try {
        if (!division.tally_url) {
          throw new Error('No Tally URL configured')
        }

        // Construct health check URL - for ngrok URLs, don't add port
        let healthUrl = division.tally_url
        if (!healthUrl.includes('ngrok')) {
          // Only add port 9000 for non-ngrok URLs
          healthUrl = division.tally_url.endsWith('/') 
            ? `${division.tally_url}9000/` 
            : `${division.tally_url}:9000/`
        } else {
          // For ngrok URLs, ensure proper trailing slash
          healthUrl = division.tally_url.endsWith('/') ? division.tally_url : `${division.tally_url}/`
        }

        console.log(`Checking health for division ${division.id} at ${healthUrl}`)

        // Make a simple request to check if Tally is responding
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'text/xml, application/xml',
            'User-Agent': 'Supabase-Health-Check/1.0',
          }
        })

        clearTimeout(timeoutId)
        responseTime = Date.now() - startTime

        if (response.ok || response.status === 200) {
          healthStatus = 'online'
          console.log(`Division ${division.id}: Tally is online (${responseTime}ms)`)
        } else {
          healthStatus = 'offline'
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
          console.log(`Division ${division.id}: Tally returned ${response.status}`)
        }

      } catch (error) {
        responseTime = Date.now() - startTime
        healthStatus = 'offline'
        errorMessage = error.message
        console.log(`Division ${division.id}: Health check failed - ${error.message}`)
      }

      // Update division health status
      const { error: updateError } = await supabase
        .from('divisions')
        .update({
          tally_health_status: healthStatus,
          last_health_check: new Date().toISOString(),
          health_check_response_time: responseTime
        })
        .eq('id', division.id)

      if (updateError) {
        console.error(`Failed to update health status for division ${division.id}:`, updateError)
      }

      healthCheckResults.push({
        division_id: division.id,
        health_status: healthStatus,
        response_time: responseTime,
        error_message: errorMessage
      })
    }

    console.log('Health check completed for all divisions')

    return new Response(
      JSON.stringify({
        success: true,
        message: `Health check completed for ${divisions?.length || 0} divisions`,
        results: healthCheckResults,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Health check function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Health check failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})