import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TallyRequest {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
  action: 'fetch' | 'update';
}

interface TallyApiResponse {
  success: boolean;
  xmlResponse?: string;
  parsedData?: any;
  statistics?: {
    totalNodes: number;
    depth: number;
    processingTime: number;
    stagingRecords: number;
  };
  error?: string;
  debugInfo?: {
    request: any;
    response: any;
    parseTime: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voucherGuid, companyId, divisionId, action }: TallyRequest = await req.json();
    
    console.log('Tally XML Staging Sync request:', { voucherGuid, companyId, divisionId, action });

    // Prepare debug containers so we can return context even on errors
    let debugRequest: any = { voucherGuid };
    let debugResponse: any = {};
    let parseTime = 0;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const startTime = Date.now();

    // Get division details to fetch Tally URL
    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('tally_url, tally_company_id')
      .eq('id', divisionId)
      .single();

    if (divisionError || !division) {
      throw new Error('Division not found or not configured');
    }

    if (!division.tally_url) {
      throw new Error('Tally URL not configured for this division');
    }

    // Get company name from mst_company table
    const { data: company, error: companyError } = await supabase
      .from('mst_company')
      .select('company_name')
      .eq('vyaapari_company_id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('Company not found in mst_company table');
    }

    // Construct Tally XML request for all vouchers
    const tallyRequest = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Export</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>DayBook</ID>
  </HEADER>
  <BODY>
    <DESC>
      <STATICVARIABLES>
        <SVCURRENTCOMPANY>${company.company_name}</SVCURRENTCOMPANY>
        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
      </STATICVARIABLES>
    </DESC>
  </BODY>
</ENVELOPE>`;

    console.log('📡 CALLING TALLY API:', {
      url: division.tally_url,
      company: company.company_name,
      voucherGuid,
      timestamp: new Date().toISOString()
    });

    // Call Tally API
    const tallyResponse = await fetch(division.tally_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'ngrok-skip-browser-warning': 'true',
        'Content-Length': tallyRequest.length.toString(),
      },
      body: tallyRequest,
    });

    if (!tallyResponse.ok) {
      throw new Error(`Tally API request failed: ${tallyResponse.status} ${tallyResponse.statusText}`);
    }

    const xmlResponse = await tallyResponse.text();
    console.log('✅ TALLY RESPONDED SUCCESSFULLY:', {
      status: tallyResponse.status,
      contentLength: xmlResponse.length,
      contentType: tallyResponse.headers.get('content-type'),
      responseTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString()
    });

    const parseStartTime = Date.now();

    // Parse XML and populate staging table if action is 'update'
    let statistics = {
      totalNodes: 0,
      depth: 0,
      processingTime: Date.now() - startTime,
      stagingRecords: 0
    };

    let stagingRecords = 0;

    if (action === 'update') {
      console.log('🧹 CLEARING EXISTING STAGING DATA:', {
        companyId,
        divisionId,
        timestamp: new Date().toISOString()
      });

      // Clear existing staging data for this voucher
      await supabase.rpc('reset_xml_staging', {
        p_company_id: companyId,
        p_division_id: divisionId
      });

      console.log('📊 STARTING XML DATA IMPORT TO STAGING:', {
        xmlLength: xmlResponse.length,
        companyId,
        divisionId,
        voucherGuid,
        timestamp: new Date().toISOString()
      });

      // Parse XML and populate staging table
      stagingRecords = await parseAndStageXml(
        supabase,
        xmlResponse,
        companyId,
        divisionId,
        voucherGuid
      );

      console.log('✅ XML DATA IMPORT COMPLETED:', {
        stagingRecords,
        processingTime: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });

      statistics.stagingRecords = stagingRecords;
    }

    // Basic XML parsing for structure analysis
    const nodeCount = (xmlResponse.match(/<[^\/][^>]*>/g) || []).length;
    const maxDepth = calculateXmlDepth(xmlResponse);

    statistics = {
      ...statistics,
      totalNodes: nodeCount,
      depth: maxDepth,
      processingTime: Date.now() - startTime
    };

    const debugInfo = {
      request: {
        url: division.tally_url,
        voucherGuid,
        requestBody: tallyRequest // Show complete XML request
      },
      response: {
        statusCode: tallyResponse.status,
        contentLength: xmlResponse.length,
        responsePreview: xmlResponse.substring(0, 2000) + (xmlResponse.length > 2000 ? '...' : '')
      },
      parseTime: Date.now() - parseStartTime
    };

    const response: TallyApiResponse = {
      success: true,
      xmlResponse: action === 'fetch' ? xmlResponse : undefined,
      statistics,
      debugInfo
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ TALLY XML STAGING SYNC ERROR:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    const errorResponse: TallyApiResponse = {
      success: false,
      error: error.message,
      statistics: {
        totalNodes: 0,
        depth: 0,
        processingTime: 0,
        stagingRecords: 0
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function parseAndStageXml(
  supabase: any,
  xmlContent: string,
  companyId: string,
  divisionId: string,
  voucherGuid: string
): Promise<number> {
  console.log('🔄 PARSING XML CONTENT:', {
    xmlLength: xmlContent.length,
    companyId,
    divisionId,
    timestamp: new Date().toISOString()
  });

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

  if (!xmlDoc || xmlDoc.querySelector('parsererror')) {
    console.error('❌ XML PARSING FAILED: Invalid XML response from Tally');
    throw new Error('Invalid XML response from Tally');
  }

  console.log('✅ XML PARSED SUCCESSFULLY, PROCESSING NODES...');

  let recordCount = 0;
  const rootElement = xmlDoc.documentElement;

  console.log('🌳 ROOT ELEMENT:', {
    tagName: rootElement.tagName,
    childElementsCount: rootElement.children.length,
    timestamp: new Date().toISOString()
  });

  // Recursively process XML nodes
  await processXmlNode(
    supabase,
    rootElement,
    null, // parent_id
    '', // path
    0, // position
    companyId,
    divisionId,
    0 // depth
  );

  console.log('📊 COUNTING STAGING RECORDS...');

  // Count records in staging
  const { count } = await supabase
    .from('xml_staging')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('division_id', divisionId);

  console.log('📋 STAGING RECORDS COUNT:', {
    totalRecords: count || 0,
    companyId,
    divisionId,
    timestamp: new Date().toISOString()
  });

  return count || 0;
}

async function processXmlNode(
  supabase: any,
  element: Element,
  parentId: string | null,
  currentPath: string,
  position: number,
  companyId: string,
  divisionId: string,
  depth: number
): Promise<string | null> {
  try {
    const tagName = element.tagName;
    const path = currentPath ? `${currentPath}/${tagName}` : tagName;
    
    // Get attributes
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    // Get text content (only direct text, not from child elements)
    let textContent = '';
    for (const child of element.childNodes) {
      if (child.nodeType === 3) { // Text node
        textContent += child.textContent?.trim() || '';
      }
    }

    // Insert node into staging table
    const { data, error } = await supabase.rpc('insert_xml_node', {
      p_tag_name: tagName,
      p_tag_value: textContent || null,
      p_attributes: Object.keys(attributes).length > 0 ? attributes : null,
      p_path: path,
      p_position: position,
      p_parent_id: parentId,
      p_company_id: companyId,
      p_division_id: divisionId
    });

    if (error) {
      console.error('Error inserting XML node:', error);
      return null;
    }

    const nodeId = data;

    // Process child elements
    const childElements = Array.from(element.children);
    for (let i = 0; i < childElements.length; i++) {
      await processXmlNode(
        supabase,
        childElements[i],
        nodeId,
        path,
        i,
        companyId,
        divisionId,
        depth + 1
      );
    }

    return nodeId;
  } catch (error) {
    console.error('Error processing XML node:', error);
    return null;
  }
}

function calculateXmlDepth(xmlContent: string): number {
  let depth = 0;
  let maxDepth = 0;
  
  const tags = xmlContent.match(/<[^>]+>/g) || [];
  
  for (const tag of tags) {
    if (tag.startsWith('</')) {
      depth--;
    } else if (!tag.endsWith('/>')) {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  
  return maxDepth;
}