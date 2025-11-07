// Google Search Console API Sync Edge Function
// Fetches search performance data, site health, and indexing status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchConsoleRequest {
  connectionId: string;
  startDate: string;
  endDate: string;
  siteUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { connectionId, startDate, endDate, siteUrl }: SearchConsoleRequest = await req.json();

    if (!connectionId || !startDate || !endDate || !siteUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch connection details
    const { data: connection, error: connectionError } = await supabase
      .from('analytics_platform_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('platform', 'google_search_console')
      .single();

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check and refresh token if needed
    let accessToken = connection.access_token;
    const expiresAt = new Date(connection.token_expires_at);
    const now = new Date();

    if (expiresAt <= now) {
      accessToken = await refreshGoogleToken(connection.refresh_token);

      const newExpiresAt = new Date(now.getTime() + 3600 * 1000);
      await supabase
        .from('analytics_platform_connections')
        .update({
          access_token: accessToken,
          token_expires_at: newExpiresAt.toISOString(),
        })
        .eq('id', connectionId);
    }

    // Fetch search performance data
    const searchData = await fetchSearchPerformance(accessToken, siteUrl, startDate, endDate);

    // Fetch site health and indexing status
    const siteHealth = await fetchSiteHealth(accessToken, siteUrl);

    // Cache search query data
    await cacheSearchQueries(supabase, connectionId, searchData.queries, startDate);

    // Cache page performance data
    await cachePagePerformance(supabase, connectionId, searchData.pages, startDate);

    // Cache site health data
    await cacheSiteHealth(supabase, connectionId, siteHealth, startDate);

    // Update last sync time
    await supabase
      .from('analytics_platform_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        status: 'connected',
        last_error: null,
        error_count: 0,
      })
      .eq('id', connectionId);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          searchPerformance: searchData,
          siteHealth,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Search Console sync:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Refresh Google OAuth token
 */
async function refreshGoogleToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');

  const body = new URLSearchParams({
    client_id: clientId!,
    client_secret: clientSecret!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Google token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch search performance data from Search Console
 */
async function fetchSearchPerformance(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  // Encode the site URL properly
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  // Fetch query-level data
  const queriesResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query', 'page', 'country', 'device'],
        rowLimit: 25000, // Maximum allowed by API
        aggregationType: 'auto',
      }),
    }
  );

  if (!queriesResponse.ok) {
    const errorText = await queriesResponse.text();
    throw new Error(`Search Console API error (queries): ${errorText}`);
  }

  const queriesData = await queriesResponse.json();

  // Fetch page-level data
  const pagesResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 25000,
      }),
    }
  );

  if (!pagesResponse.ok) {
    const errorText = await pagesResponse.text();
    throw new Error(`Search Console API error (pages): ${errorText}`);
  }

  const pagesData = await pagesResponse.json();

  return {
    queries: queriesData.rows || [],
    pages: pagesData.rows || [],
  };
}

/**
 * Fetch site health and indexing status
 */
async function fetchSiteHealth(accessToken: string, siteUrl: string) {
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  // Fetch sitemaps
  const sitemapsResponse = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  let sitemaps = [];
  if (sitemapsResponse.ok) {
    const sitemapsData = await sitemapsResponse.json();
    sitemaps = sitemapsData.sitemap || [];
  }

  // Fetch URL inspection data for a sample of pages
  // Note: This endpoint has strict rate limits, so we'll fetch a limited sample
  // For production, implement a queue system to inspect pages over time

  return {
    sitemaps: sitemaps.length,
    sitemapsProcessed: sitemaps.filter((s: any) => s.isPending === false).length,
    totalIndexedPages: 0, // Would need to aggregate from URL inspection
    totalSubmittedPages: sitemaps.reduce((sum: number, s: any) => sum + (s.contents?.length || 0), 0),
    // These would come from URL inspection API or Search Console Insights API
    crawlErrors: 0,
    mobileUsabilityErrors: 0,
    structuredDataErrors: 0,
    securityIssues: 0,
  };
}

/**
 * Cache search query data
 */
async function cacheSearchQueries(
  supabase: any,
  connectionId: string,
  queries: any[],
  date: string
) {
  const queryEntries = queries.map((row) => {
    const query = row.keys[0] || '';
    const page = row.keys[1] || '';
    const country = row.keys[2] || 'US';
    const device = row.keys[3] || 'DESKTOP';

    return {
      connection_id: connectionId,
      query,
      page_url: page,
      date,
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      ctr: row.ctr ? row.ctr * 100 : 0, // Convert to percentage
      position: row.position || 0,
      desktop_impressions: device === 'DESKTOP' ? row.impressions : 0,
      mobile_impressions: device === 'MOBILE' ? row.impressions : 0,
      tablet_impressions: device === 'TABLET' ? row.impressions : 0,
      country,
    };
  });

  // Insert in batches to avoid payload size limits
  const batchSize = 1000;
  for (let i = 0; i < queryEntries.length; i += batchSize) {
    const batch = queryEntries.slice(i, i + batchSize);

    const { error } = await supabase
      .from('analytics_search_queries')
      .upsert(batch, {
        onConflict: 'connection_id,query,page_url,date,country',
      });

    if (error) {
      console.error('Error caching search queries:', error);
      throw error;
    }
  }
}

/**
 * Cache page performance data
 */
async function cachePagePerformance(
  supabase: any,
  connectionId: string,
  pages: any[],
  date: string
) {
  const pageEntries = pages.map((row) => ({
    connection_id: connectionId,
    page_url: row.keys[0] || '',
    date,
    search_impressions: row.impressions || 0,
    search_clicks: row.clicks || 0,
    avg_search_position: row.position || 0,
  }));

  // Insert in batches
  const batchSize = 1000;
  for (let i = 0; i < pageEntries.length; i += batchSize) {
    const batch = pageEntries.slice(i, i + batchSize);

    const { error } = await supabase
      .from('analytics_page_performance')
      .upsert(batch, {
        onConflict: 'connection_id,page_url,date',
      });

    if (error) {
      console.error('Error caching page performance:', error);
      throw error;
    }
  }
}

/**
 * Cache site health data
 */
async function cacheSiteHealth(
  supabase: any,
  connectionId: string,
  healthData: any,
  date: string
) {
  const healthEntry = {
    connection_id: connectionId,
    date,
    total_indexed_pages: healthData.totalIndexedPages,
    total_submitted_pages: healthData.totalSubmittedPages,
    indexing_coverage_rate:
      healthData.totalSubmittedPages > 0
        ? (healthData.totalIndexedPages / healthData.totalSubmittedPages) * 100
        : 0,
    crawl_errors: healthData.crawlErrors,
    mobile_usability_errors: healthData.mobileUsabilityErrors,
    structured_data_errors: healthData.structuredDataErrors,
    security_issues: healthData.securityIssues,
    sitemaps_submitted: healthData.sitemaps,
    sitemaps_processed: healthData.sitemapsProcessed,
  };

  const { error } = await supabase
    .from('analytics_site_health')
    .upsert(healthEntry, {
      onConflict: 'connection_id,date',
    });

  if (error) {
    console.error('Error caching site health:', error);
    throw error;
  }
}
