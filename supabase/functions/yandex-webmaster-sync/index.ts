// Yandex Webmaster API Sync Edge Function
// Fetches search performance and site health data from Yandex

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YandexWebmasterRequest {
  connectionId: string;
  hostId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { connectionId, hostId }: YandexWebmasterRequest = await req.json();

    if (!connectionId || !hostId) {
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
      .eq('platform', 'yandex_webmaster')
      .single();

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Yandex tokens don't expire in the same way, but we still check
    const accessToken = connection.access_token;
    const userId = connection.account_id;

    // Fetch search queries
    const searchQueries = await fetchYandexSearchQueries(accessToken, userId, hostId);

    // Fetch indexing stats
    const indexingStats = await fetchYandexIndexingStats(accessToken, userId, hostId);

    // Fetch site quality indicators
    const siteQuality = await fetchYandexSiteQuality(accessToken, userId, hostId);

    // Cache the data
    await cacheYandexSearchQueries(supabase, connectionId, searchQueries);
    await cacheYandexSiteHealth(supabase, connectionId, indexingStats, siteQuality);

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
          searchQueries,
          indexingStats,
          siteQuality,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Yandex Webmaster sync:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Fetch search queries from Yandex Webmaster
 */
async function fetchYandexSearchQueries(
  accessToken: string,
  userId: string,
  hostId: string
) {
  // Get popular queries
  const response = await fetch(
    `https://api.webmaster.yandex.net/v4/user/${userId}/hosts/${hostId}/search-queries/popular`,
    {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yandex Webmaster API error (search queries): ${errorText}`);
  }

  const data = await response.json();
  return data.queries || [];
}

/**
 * Fetch indexing statistics from Yandex Webmaster
 */
async function fetchYandexIndexingStats(
  accessToken: string,
  userId: string,
  hostId: string
) {
  const response = await fetch(
    `https://api.webmaster.yandex.net/v4/user/${userId}/hosts/${hostId}/summary`,
    {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yandex Webmaster API error (indexing stats): ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Fetch site quality indicators from Yandex Webmaster
 */
async function fetchYandexSiteQuality(
  accessToken: string,
  userId: string,
  hostId: string
) {
  const response = await fetch(
    `https://api.webmaster.yandex.net/v4/user/${userId}/hosts/${hostId}/site-quality`,
    {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    // Site quality endpoint may not be available for all sites
    console.warn('Yandex site quality not available:', errorText);
    return {};
  }

  const data = await response.json();
  return data;
}

/**
 * Cache Yandex search query data
 */
async function cacheYandexSearchQueries(
  supabase: any,
  connectionId: string,
  queries: any[]
) {
  const today = new Date().toISOString().split('T')[0];

  const queryEntries = queries.map((query) => ({
    connection_id: connectionId,
    query: query.query_text || '',
    page_url: '', // Yandex doesn't provide per-page data in popular queries
    date: today,
    impressions: query.shows || 0,
    clicks: query.clicks || 0,
    ctr: query.shows > 0 ? (query.clicks / query.shows) * 100 : 0,
    position: query.position || 0,
    country: 'RU', // Yandex is primarily Russian search engine
  }));

  if (queryEntries.length > 0) {
    const { error } = await supabase
      .from('analytics_search_queries')
      .upsert(queryEntries, {
        onConflict: 'connection_id,query,page_url,date,country',
      });

    if (error) {
      console.error('Error caching Yandex search queries:', error);
      throw error;
    }
  }
}

/**
 * Cache Yandex site health data
 */
async function cacheYandexSiteHealth(
  supabase: any,
  connectionId: string,
  indexingStats: any,
  siteQuality: any
) {
  const today = new Date().toISOString().split('T')[0];

  const healthEntry = {
    connection_id: connectionId,
    date: today,
    total_indexed_pages: indexingStats.site_index_status?.indexed_urls_count || 0,
    crawl_errors: indexingStats.site_problems?.critical_count || 0,
    mobile_usability_errors: siteQuality.mobile_friendly_errors || 0,
    security_issues: indexingStats.site_problems?.security_count || 0,
  };

  const { error } = await supabase
    .from('analytics_site_health')
    .upsert(healthEntry, {
      onConflict: 'connection_id,date',
    });

  if (error) {
    console.error('Error caching Yandex site health:', error);
    throw error;
  }
}
