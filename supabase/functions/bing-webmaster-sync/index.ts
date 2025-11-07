// Bing Webmaster Tools API Sync Edge Function
// Fetches search performance and site health data from Bing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BingWebmasterRequest {
  connectionId: string;
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

    const { connectionId, siteUrl }: BingWebmasterRequest = await req.json();

    if (!connectionId || !siteUrl) {
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
      .eq('platform', 'bing_webmaster')
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
      accessToken = await refreshMicrosoftToken(connection.refresh_token);

      const newExpiresAt = new Date(now.getTime() + 3600 * 1000);
      await supabase
        .from('analytics_platform_connections')
        .update({
          access_token: accessToken,
          token_expires_at: newExpiresAt.toISOString(),
        })
        .eq('id', connectionId);
    }

    // Fetch Bing Webmaster data
    const apiKey = connection.config?.apiKey || accessToken; // Bing uses API key

    // Fetch query stats
    const queryStats = await fetchBingQueryStats(apiKey, siteUrl);

    // Fetch page stats
    const pageStats = await fetchBingPageStats(apiKey, siteUrl);

    // Fetch URL and crawl info
    const crawlStats = await fetchBingCrawlStats(apiKey, siteUrl);

    // Cache the data
    await cacheBingSearchQueries(supabase, connectionId, queryStats);
    await cacheBingPagePerformance(supabase, connectionId, pageStats);
    await cacheBingSiteHealth(supabase, connectionId, crawlStats);

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
          queryStats,
          pageStats,
          crawlStats,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Bing Webmaster sync:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Refresh Microsoft OAuth token
 */
async function refreshMicrosoftToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('MICROSOFT_OAUTH_CLIENT_ID');
  const clientSecret = Deno.env.get('MICROSOFT_OAUTH_CLIENT_SECRET');

  const body = new URLSearchParams({
    client_id: clientId!,
    client_secret: clientSecret!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    scope: 'https://api.bing.microsoft.com/.default',
  });

  const response = await fetch(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to refresh Microsoft token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch query statistics from Bing Webmaster Tools
 */
async function fetchBingQueryStats(apiKey: string, siteUrl: string) {
  const response = await fetch(
    `https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?siteUrl=${encodeURIComponent(siteUrl)}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bing Webmaster API error (query stats): ${errorText}`);
  }

  const data = await response.json();
  return data.d || [];
}

/**
 * Fetch page statistics from Bing Webmaster Tools
 */
async function fetchBingPageStats(apiKey: string, siteUrl: string) {
  const response = await fetch(
    `https://ssl.bing.com/webmaster/api.svc/json/GetPageStats?siteUrl=${encodeURIComponent(siteUrl)}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bing Webmaster API error (page stats): ${errorText}`);
  }

  const data = await response.json();
  return data.d || [];
}

/**
 * Fetch crawl statistics from Bing Webmaster Tools
 */
async function fetchBingCrawlStats(apiKey: string, siteUrl: string) {
  const response = await fetch(
    `https://ssl.bing.com/webmaster/api.svc/json/GetCrawlStats?siteUrl=${encodeURIComponent(siteUrl)}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bing Webmaster API error (crawl stats): ${errorText}`);
  }

  const data = await response.json();
  return data.d || {};
}

/**
 * Cache Bing search query data
 */
async function cacheBingSearchQueries(
  supabase: any,
  connectionId: string,
  queryStats: any[]
) {
  const today = new Date().toISOString().split('T')[0];

  const queryEntries = queryStats.map((stat) => ({
    connection_id: connectionId,
    query: stat.Query || '',
    page_url: stat.Url || '',
    date: today,
    impressions: stat.Impressions || 0,
    clicks: stat.Clicks || 0,
    ctr: stat.Impressions > 0 ? (stat.Clicks / stat.Impressions) * 100 : 0,
    position: stat.AvgImpressionPosition || 0,
    country: 'US', // Bing API doesn't provide country-level data in basic tier
  }));

  if (queryEntries.length > 0) {
    const { error } = await supabase
      .from('analytics_search_queries')
      .upsert(queryEntries, {
        onConflict: 'connection_id,query,page_url,date,country',
      });

    if (error) {
      console.error('Error caching Bing search queries:', error);
      throw error;
    }
  }
}

/**
 * Cache Bing page performance data
 */
async function cacheBingPagePerformance(
  supabase: any,
  connectionId: string,
  pageStats: any[]
) {
  const today = new Date().toISOString().split('T')[0];

  const pageEntries = pageStats.map((stat) => ({
    connection_id: connectionId,
    page_url: stat.Url || '',
    date: today,
    search_impressions: stat.Impressions || 0,
    search_clicks: stat.Clicks || 0,
    avg_search_position: stat.AvgImpressionPosition || 0,
  }));

  if (pageEntries.length > 0) {
    const { error } = await supabase
      .from('analytics_page_performance')
      .upsert(pageEntries, {
        onConflict: 'connection_id,page_url,date',
      });

    if (error) {
      console.error('Error caching Bing page performance:', error);
      throw error;
    }
  }
}

/**
 * Cache Bing site health data
 */
async function cacheBingSiteHealth(
  supabase: any,
  connectionId: string,
  crawlStats: any
) {
  const today = new Date().toISOString().split('T')[0];

  const healthEntry = {
    connection_id: connectionId,
    date: today,
    pages_crawled: crawlStats.CrawledPages || 0,
    crawl_errors: crawlStats.CrawlErrors || 0,
    total_indexed_pages: crawlStats.InIndex || 0,
  };

  const { error } = await supabase
    .from('analytics_site_health')
    .upsert(healthEntry, {
      onConflict: 'connection_id,date',
    });

  if (error) {
    console.error('Error caching Bing site health:', error);
    throw error;
  }
}
