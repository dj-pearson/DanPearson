// Google Analytics Data API Sync Edge Function
// Fetches analytics data from Google Analytics 4 and caches it in Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  connectionId: string;
  startDate: string;
  endDate: string;
  propertyId: string;
}

interface AnalyticsMetrics {
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  engagedSessions: number;
  engagementRate: number;
  events: number;
  desktopSessions: number;
  mobileSessions: number;
  tabletSessions: number;
  trafficSources: any;
  geographicData: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { connectionId, startDate, endDate, propertyId }: AnalyticsRequest = await req.json();

    if (!connectionId || !startDate || !endDate || !propertyId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch connection details from database
    const { data: connection, error: connectionError } = await supabase
      .from('analytics_platform_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('platform', 'google_analytics')
      .single();

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = connection.access_token;
    const expiresAt = new Date(connection.token_expires_at);
    const now = new Date();

    if (expiresAt <= now) {
      // Token is expired, refresh it
      accessToken = await refreshGoogleToken(connection.refresh_token);

      // Update connection with new token
      const newExpiresAt = new Date(now.getTime() + 3600 * 1000); // 1 hour from now

      await supabase
        .from('analytics_platform_connections')
        .update({
          access_token: accessToken,
          token_expires_at: newExpiresAt.toISOString(),
        })
        .eq('id', connectionId);
    }

    // Fetch analytics data from Google Analytics Data API
    const analyticsData = await fetchGoogleAnalyticsData(
      accessToken,
      propertyId,
      startDate,
      endDate
    );

    // Cache the data in database
    await cacheAnalyticsData(supabase, connectionId, analyticsData, startDate, endDate);

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
      JSON.stringify({ success: true, data: analyticsData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Google Analytics sync:', error);

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
 * Fetch analytics data from Google Analytics Data API (GA4)
 */
async function fetchGoogleAnalyticsData(
  accessToken: string,
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<AnalyticsMetrics> {
  const apiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  // Define the request payload for GA4 Data API
  const requestBody = {
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'deviceCategory' },
      { name: 'sessionDefaultChannelGroup' },
      { name: 'country' },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
      { name:'averageSessionDuration' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'eventCount' },
    ],
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Analytics API error: ${errorText}`);
  }

  const data = await response.json();

  // Process and aggregate the data
  return processGoogleAnalyticsData(data);
}

/**
 * Process Google Analytics API response
 */
function processGoogleAnalyticsData(apiResponse: any): AnalyticsMetrics {
  const rows = apiResponse.rows || [];

  let totalSessions = 0;
  let totalUsers = 0;
  let totalNewUsers = 0;
  let totalPageviews = 0;
  let weightedBounceRate = 0;
  let weightedSessionDuration = 0;
  let totalEngagedSessions = 0;
  let weightedEngagementRate = 0;
  let totalEvents = 0;

  let desktopSessions = 0;
  let mobileSessions = 0;
  let tabletSessions = 0;

  const trafficSourcesMap: Record<string, number> = {};
  const geoDataMap: Record<string, number> = {};

  rows.forEach((row: any) => {
    const deviceCategory = row.dimensionValues[0]?.value || 'unknown';
    const channelGroup = row.dimensionValues[1]?.value || 'unknown';
    const country = row.dimensionValues[2]?.value || 'unknown';

    const sessions = parseInt(row.metricValues[0]?.value || '0');
    const users = parseInt(row.metricValues[1]?.value || '0');
    const newUsers = parseInt(row.metricValues[2]?.value || '0');
    const pageviews = parseInt(row.metricValues[3]?.value || '0');
    const bounceRate = parseFloat(row.metricValues[4]?.value || '0');
    const sessionDuration = parseFloat(row.metricValues[5]?.value || '0');
    const engagedSessions = parseInt(row.metricValues[6]?.value || '0');
    const engagementRate = parseFloat(row.metricValues[7]?.value || '0');
    const events = parseInt(row.metricValues[8]?.value || '0');

    totalSessions += sessions;
    totalUsers += users;
    totalNewUsers += newUsers;
    totalPageviews += pageviews;
    weightedBounceRate += bounceRate * sessions;
    weightedSessionDuration += sessionDuration * sessions;
    totalEngagedSessions += engagedSessions;
    weightedEngagementRate += engagementRate * sessions;
    totalEvents += events;

    // Device breakdown
    if (deviceCategory.toLowerCase() === 'desktop') {
      desktopSessions += sessions;
    } else if (deviceCategory.toLowerCase() === 'mobile') {
      mobileSessions += sessions;
    } else if (deviceCategory.toLowerCase() === 'tablet') {
      tabletSessions += sessions;
    }

    // Traffic sources
    trafficSourcesMap[channelGroup] = (trafficSourcesMap[channelGroup] || 0) + sessions;

    // Geographic data
    geoDataMap[country] = (geoDataMap[country] || 0) + sessions;
  });

  return {
    sessions: totalSessions,
    users: totalUsers,
    newUsers: totalNewUsers,
    pageviews: totalPageviews,
    bounceRate: totalSessions > 0 ? weightedBounceRate / totalSessions : 0,
    avgSessionDuration: totalSessions > 0 ? weightedSessionDuration / totalSessions : 0,
    engagedSessions: totalEngagedSessions,
    engagementRate: totalSessions > 0 ? weightedEngagementRate / totalSessions : 0,
    events: totalEvents,
    desktopSessions,
    mobileSessions,
    tabletSessions,
    trafficSources: trafficSourcesMap,
    geographicData: geoDataMap,
  };
}

/**
 * Cache analytics data in Supabase
 */
async function cacheAnalyticsData(
  supabase: any,
  connectionId: string,
  data: AnalyticsMetrics,
  startDate: string,
  endDate: string
) {
  // Determine granularity based on date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  let granularity = 'daily';
  if (daysDiff > 90) {
    granularity = 'monthly';
  } else if (daysDiff > 14) {
    granularity = 'weekly';
  }

  const cacheEntry = {
    connection_id: connectionId,
    date: startDate,
    granularity,
    sessions: data.sessions,
    users: data.users,
    new_users: data.newUsers,
    pageviews: data.pageviews,
    bounce_rate: data.bounceRate,
    avg_session_duration: data.avgSessionDuration,
    engaged_sessions: data.engagedSessions,
    engagement_rate: data.engagementRate,
    events: data.events,
    desktop_sessions: data.desktopSessions,
    mobile_sessions: data.mobileSessions,
    tablet_sessions: data.tabletSessions,
    traffic_sources: data.trafficSources,
    geographic_data: data.geographicData,
  };

  const { error } = await supabase
    .from('analytics_traffic_cache')
    .upsert(cacheEntry, {
      onConflict: 'connection_id,date,granularity',
    });

  if (error) {
    console.error('Error caching analytics data:', error);
    throw error;
  }
}
