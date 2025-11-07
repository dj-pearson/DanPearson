-- =====================================================
-- SEO & Traffic Analytics Dashboard Schema
-- =====================================================
-- This migration creates all necessary tables for the
-- unified analytics dashboard that integrates multiple
-- platforms (Google Analytics, Search Console, Bing, Yandex)
-- =====================================================

-- Platform Connections Table
-- Stores OAuth tokens and connection status for each analytics platform
CREATE TABLE IF NOT EXISTS analytics_platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'google_analytics', 'google_search_console', 'bing_webmaster', 'yandex_webmaster'
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error', 'expired'

    -- OAuth credentials (encrypted at application level)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,

    -- Platform-specific configuration
    account_id TEXT, -- Platform account ID
    property_id TEXT, -- Google Analytics property ID or site URL
    config JSONB DEFAULT '{}', -- Additional platform-specific settings

    -- Connection metadata
    last_sync_at TIMESTAMPTZ,
    sync_frequency_minutes INTEGER DEFAULT 60, -- How often to sync data
    sync_enabled BOOLEAN DEFAULT true,

    -- Error tracking
    last_error TEXT,
    error_count INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one connection per user per platform per property
    UNIQUE(user_id, platform, property_id)
);

CREATE INDEX idx_platform_connections_user ON analytics_platform_connections(user_id);
CREATE INDEX idx_platform_connections_status ON analytics_platform_connections(status);
CREATE INDEX idx_platform_connections_sync ON analytics_platform_connections(last_sync_at) WHERE sync_enabled = true;

-- Traffic Data Cache Table
-- Stores aggregated traffic metrics from all platforms
CREATE TABLE IF NOT EXISTS analytics_traffic_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES analytics_platform_connections(id) ON DELETE CASCADE,

    -- Time dimension
    date DATE NOT NULL,
    granularity VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'

    -- Traffic metrics
    sessions INTEGER DEFAULT 0,
    users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    pageviews INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2),
    avg_session_duration DECIMAL(10,2), -- in seconds

    -- Engagement metrics
    engaged_sessions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    events INTEGER DEFAULT 0,

    -- E-commerce metrics (if applicable)
    transactions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2),

    -- Device breakdown
    desktop_sessions INTEGER DEFAULT 0,
    mobile_sessions INTEGER DEFAULT 0,
    tablet_sessions INTEGER DEFAULT 0,

    -- Source breakdown (stored as JSONB for flexibility)
    traffic_sources JSONB DEFAULT '{}',

    -- Geographic data (top countries)
    geographic_data JSONB DEFAULT '{}',

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique entries per connection, date, and granularity
    UNIQUE(connection_id, date, granularity)
);

CREATE INDEX idx_traffic_cache_connection ON analytics_traffic_cache(connection_id);
CREATE INDEX idx_traffic_cache_date ON analytics_traffic_cache(date DESC);
CREATE INDEX idx_traffic_cache_granularity ON analytics_traffic_cache(granularity);

-- Search Query Performance Table
-- Stores search query data from Search Console and Bing/Yandex Webmaster
CREATE TABLE IF NOT EXISTS analytics_search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES analytics_platform_connections(id) ON DELETE CASCADE,

    -- Query information
    query TEXT NOT NULL,
    page_url TEXT NOT NULL,

    -- Time dimension
    date DATE NOT NULL,

    -- Search metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5,2), -- Click-through rate
    position DECIMAL(5,2), -- Average position

    -- Device breakdown
    desktop_impressions INTEGER DEFAULT 0,
    mobile_impressions INTEGER DEFAULT 0,
    tablet_impressions INTEGER DEFAULT 0,

    -- Country (ISO 2-letter code)
    country VARCHAR(2) DEFAULT 'US',

    -- Search appearance features
    search_appearance JSONB DEFAULT '{}', -- Rich results, featured snippets, etc.

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique entries
    UNIQUE(connection_id, query, page_url, date, country)
);

CREATE INDEX idx_search_queries_connection ON analytics_search_queries(connection_id);
CREATE INDEX idx_search_queries_date ON analytics_search_queries(date DESC);
CREATE INDEX idx_search_queries_query ON analytics_search_queries(query);
CREATE INDEX idx_search_queries_clicks ON analytics_search_queries(clicks DESC);
CREATE INDEX idx_search_queries_impressions ON analytics_search_queries(impressions DESC);
CREATE INDEX idx_search_queries_position ON analytics_search_queries(position);

-- Page Performance Table
-- Stores page-level performance metrics
CREATE TABLE IF NOT EXISTS analytics_page_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES analytics_platform_connections(id) ON DELETE CASCADE,

    -- Page information
    page_url TEXT NOT NULL,
    page_title TEXT,

    -- Time dimension
    date DATE NOT NULL,

    -- Traffic metrics
    pageviews INTEGER DEFAULT 0,
    unique_pageviews INTEGER DEFAULT 0,
    avg_time_on_page DECIMAL(10,2), -- in seconds
    entrances INTEGER DEFAULT 0,
    exits INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2),

    -- Search metrics (from Search Console)
    search_impressions INTEGER DEFAULT 0,
    search_clicks INTEGER DEFAULT 0,
    avg_search_position DECIMAL(5,2),

    -- Core Web Vitals
    lcp DECIMAL(10,2), -- Largest Contentful Paint (seconds)
    fid DECIMAL(10,2), -- First Input Delay (milliseconds)
    cls DECIMAL(5,3), -- Cumulative Layout Shift
    fcp DECIMAL(10,2), -- First Contentful Paint (seconds)
    ttfb DECIMAL(10,2), -- Time to First Byte (seconds)

    -- Core Web Vitals pass rates
    lcp_good_rate DECIMAL(5,2),
    fid_good_rate DECIMAL(5,2),
    cls_good_rate DECIMAL(5,2),

    -- Conversion metrics
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique entries
    UNIQUE(connection_id, page_url, date)
);

CREATE INDEX idx_page_performance_connection ON analytics_page_performance(connection_id);
CREATE INDEX idx_page_performance_date ON analytics_page_performance(date DESC);
CREATE INDEX idx_page_performance_url ON analytics_page_performance(page_url);
CREATE INDEX idx_page_performance_pageviews ON analytics_page_performance(pageviews DESC);
CREATE INDEX idx_page_performance_search_clicks ON analytics_page_performance(search_clicks DESC);

-- Site Health & Indexing Table
-- Stores site health metrics and indexing status
CREATE TABLE IF NOT EXISTS analytics_site_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES analytics_platform_connections(id) ON DELETE CASCADE,

    -- Time dimension
    date DATE NOT NULL,

    -- Indexing status
    total_indexed_pages INTEGER DEFAULT 0,
    total_submitted_pages INTEGER DEFAULT 0,
    indexing_coverage_rate DECIMAL(5,2),

    -- Crawl statistics
    pages_crawled INTEGER DEFAULT 0,
    crawl_errors INTEGER DEFAULT 0,

    -- Issue tracking
    mobile_usability_errors INTEGER DEFAULT 0,
    mobile_usability_warnings INTEGER DEFAULT 0,

    structured_data_errors INTEGER DEFAULT 0,
    structured_data_warnings INTEGER DEFAULT 0,

    security_issues INTEGER DEFAULT 0,

    -- Core Web Vitals status
    cwv_good_urls INTEGER DEFAULT 0,
    cwv_needs_improvement_urls INTEGER DEFAULT 0,
    cwv_poor_urls INTEGER DEFAULT 0,

    -- Detailed issue breakdown (stored as JSONB)
    crawl_errors_detail JSONB DEFAULT '{}',
    mobile_issues_detail JSONB DEFAULT '{}',
    structured_data_issues_detail JSONB DEFAULT '{}',
    security_issues_detail JSONB DEFAULT '{}',

    -- Sitemaps
    sitemaps_submitted INTEGER DEFAULT 0,
    sitemaps_processed INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique entries
    UNIQUE(connection_id, date)
);

CREATE INDEX idx_site_health_connection ON analytics_site_health(connection_id);
CREATE INDEX idx_site_health_date ON analytics_site_health(date DESC);
CREATE INDEX idx_site_health_errors ON analytics_site_health(crawl_errors);

-- Alerts & Notifications Table
-- Stores alert configurations and triggered alerts
CREATE TABLE IF NOT EXISTS analytics_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES analytics_platform_connections(id) ON DELETE CASCADE,

    -- Alert configuration
    alert_type VARCHAR(50) NOT NULL, -- 'traffic_drop', 'ranking_change', 'indexing_issue', 'cwv_decline', 'error_spike'
    alert_name VARCHAR(200) NOT NULL,
    enabled BOOLEAN DEFAULT true,

    -- Conditions (stored as JSONB for flexibility)
    conditions JSONB NOT NULL, -- e.g., {"metric": "traffic", "operator": "decrease", "threshold": 20, "period": "7d"}

    -- Notification settings
    notification_channels JSONB DEFAULT '["email"]', -- 'email', 'webhook', 'slack'
    notification_frequency VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'

    -- Alert status
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON analytics_alerts(user_id);
CREATE INDEX idx_alerts_enabled ON analytics_alerts(enabled) WHERE enabled = true;
CREATE INDEX idx_alerts_triggered ON analytics_alerts(last_triggered_at);

-- Alert History Table
-- Stores history of triggered alerts
CREATE TABLE IF NOT EXISTS analytics_alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES analytics_alerts(id) ON DELETE CASCADE,

    -- Alert details
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'

    -- Triggered data
    message TEXT NOT NULL,
    metric_value DECIMAL(12,2),
    previous_value DECIMAL(12,2),
    change_percentage DECIMAL(5,2),

    -- Context
    affected_urls TEXT[],
    affected_queries TEXT[],
    metadata JSONB DEFAULT '{}',

    -- Status
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'dismissed'
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES admin_users(id),
    resolved_at TIMESTAMPTZ,

    -- Audit fields
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_history_alert ON analytics_alert_history(alert_id);
CREATE INDEX idx_alert_history_status ON analytics_alert_history(status);
CREATE INDEX idx_alert_history_triggered ON analytics_alert_history(triggered_at DESC);
CREATE INDEX idx_alert_history_severity ON analytics_alert_history(severity);

-- Data Export History Table
-- Tracks export operations
CREATE TABLE IF NOT EXISTS analytics_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,

    -- Export configuration
    export_type VARCHAR(50) NOT NULL, -- 'traffic', 'search_queries', 'page_performance', 'site_health', 'full'
    format VARCHAR(10) NOT NULL, -- 'csv', 'json', 'xlsx', 'pdf'

    -- Date range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Filters applied
    filters JSONB DEFAULT '{}',

    -- Export status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    file_path TEXT,
    file_size_bytes BIGINT,

    -- Error tracking
    error_message TEXT,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') -- Exports expire after 7 days
);

CREATE INDEX idx_exports_user ON analytics_exports(user_id);
CREATE INDEX idx_exports_status ON analytics_exports(status);
CREATE INDEX idx_exports_created ON analytics_exports(created_at DESC);
CREATE INDEX idx_exports_expires ON analytics_exports(expires_at);

-- Keyword Rankings Table
-- Tracks keyword rankings over time for SEO monitoring
CREATE TABLE IF NOT EXISTS analytics_keyword_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES analytics_platform_connections(id) ON DELETE CASCADE,

    -- Keyword information
    keyword TEXT NOT NULL,
    target_url TEXT,

    -- Ranking data
    date DATE NOT NULL,
    position INTEGER,
    previous_position INTEGER,
    position_change INTEGER, -- Calculated: previous_position - position (positive = improvement)

    -- Search metrics
    search_volume INTEGER,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5,2),

    -- Competition and opportunity
    difficulty_score INTEGER, -- 0-100
    opportunity_score INTEGER, -- 0-100, based on volume and current position

    -- SERP features
    serp_features JSONB DEFAULT '{}', -- Featured snippet, local pack, video, etc.

    -- Geographic targeting
    country VARCHAR(2) DEFAULT 'US',

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique entries
    UNIQUE(connection_id, keyword, date, country)
);

CREATE INDEX idx_keyword_rankings_connection ON analytics_keyword_rankings(connection_id);
CREATE INDEX idx_keyword_rankings_keyword ON analytics_keyword_rankings(keyword);
CREATE INDEX idx_keyword_rankings_date ON analytics_keyword_rankings(date DESC);
CREATE INDEX idx_keyword_rankings_position ON analytics_keyword_rankings(position);
CREATE INDEX idx_keyword_rankings_change ON analytics_keyword_rankings(position_change DESC);

-- Competitor Analysis Table (Future enhancement)
CREATE TABLE IF NOT EXISTS analytics_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,

    -- Competitor information
    competitor_name VARCHAR(200) NOT NULL,
    competitor_domain TEXT NOT NULL,

    -- Tracking settings
    enabled BOOLEAN DEFAULT true,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, competitor_domain)
);

-- Backlink Tracking Table (Future enhancement with integration to services like Ahrefs API)
CREATE TABLE IF NOT EXISTS analytics_backlinks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES analytics_platform_connections(id) ON DELETE CASCADE,

    -- Backlink information
    source_url TEXT NOT NULL,
    source_domain TEXT NOT NULL,
    target_url TEXT NOT NULL,
    anchor_text TEXT,

    -- Link attributes
    link_type VARCHAR(20), -- 'dofollow', 'nofollow', 'ugc', 'sponsored'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'lost', 'new'

    -- Metrics
    domain_rating INTEGER, -- Authority score of source domain
    first_seen_at DATE,
    last_seen_at DATE,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(source_url, target_url)
);

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_platform_connections_updated_at BEFORE UPDATE ON analytics_platform_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_traffic_cache_updated_at BEFORE UPDATE ON analytics_traffic_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_search_queries_updated_at BEFORE UPDATE ON analytics_search_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_performance_updated_at BEFORE UPDATE ON analytics_page_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_health_updated_at BEFORE UPDATE ON analytics_site_health FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON analytics_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON analytics_competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backlinks_updated_at BEFORE UPDATE ON analytics_backlinks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE analytics_platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_traffic_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_site_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_backlinks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform connections (users can only see their own connections)
CREATE POLICY platform_connections_user_policy ON analytics_platform_connections
    FOR ALL USING (user_id = (SELECT id FROM admin_users WHERE id = auth.uid()));

-- RLS Policies for cached data (accessible through connections)
CREATE POLICY traffic_cache_connection_policy ON analytics_traffic_cache
    FOR ALL USING (
        connection_id IN (
            SELECT id FROM analytics_platform_connections WHERE user_id = auth.uid()
        )
    );

CREATE POLICY search_queries_connection_policy ON analytics_search_queries
    FOR ALL USING (
        connection_id IN (
            SELECT id FROM analytics_platform_connections WHERE user_id = auth.uid()
        )
    );

CREATE POLICY page_performance_connection_policy ON analytics_page_performance
    FOR ALL USING (
        connection_id IN (
            SELECT id FROM analytics_platform_connections WHERE user_id = auth.uid()
        )
    );

CREATE POLICY site_health_connection_policy ON analytics_site_health
    FOR ALL USING (
        connection_id IN (
            SELECT id FROM analytics_platform_connections WHERE user_id = auth.uid()
        )
    );

CREATE POLICY keyword_rankings_connection_policy ON analytics_keyword_rankings
    FOR ALL USING (
        connection_id IN (
            SELECT id FROM analytics_platform_connections WHERE user_id = auth.uid()
        )
    );

CREATE POLICY backlinks_connection_policy ON analytics_backlinks
    FOR ALL USING (
        connection_id IN (
            SELECT id FROM analytics_platform_connections WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for alerts (users can only see their own alerts)
CREATE POLICY alerts_user_policy ON analytics_alerts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY alert_history_user_policy ON analytics_alert_history
    FOR ALL USING (
        alert_id IN (
            SELECT id FROM analytics_alerts WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for exports (users can only see their own exports)
CREATE POLICY exports_user_policy ON analytics_exports
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for competitors (users can only see their own competitors)
CREATE POLICY competitors_user_policy ON analytics_competitors
    FOR ALL USING (user_id = auth.uid());

-- Create views for common queries
CREATE OR REPLACE VIEW analytics_dashboard_summary AS
SELECT
    apc.user_id,
    apc.platform,
    apc.property_id,
    COUNT(DISTINCT atc.id) as traffic_data_points,
    MAX(atc.date) as latest_traffic_data,
    SUM(atc.sessions) as total_sessions,
    SUM(atc.pageviews) as total_pageviews,
    COUNT(DISTINCT asq.query) as unique_queries,
    SUM(asq.clicks) as total_search_clicks,
    AVG(asq.position) as avg_search_position
FROM analytics_platform_connections apc
LEFT JOIN analytics_traffic_cache atc ON atc.connection_id = apc.id
LEFT JOIN analytics_search_queries asq ON asq.connection_id = apc.id
WHERE apc.status = 'connected'
GROUP BY apc.user_id, apc.platform, apc.property_id;

-- Comments for documentation
COMMENT ON TABLE analytics_platform_connections IS 'Stores OAuth connections and credentials for analytics platforms';
COMMENT ON TABLE analytics_traffic_cache IS 'Caches aggregated traffic metrics from all connected platforms';
COMMENT ON TABLE analytics_search_queries IS 'Stores search query performance data from Search Console and Webmaster Tools';
COMMENT ON TABLE analytics_page_performance IS 'Stores page-level performance metrics including Core Web Vitals';
COMMENT ON TABLE analytics_site_health IS 'Tracks site health, indexing status, and technical SEO issues';
COMMENT ON TABLE analytics_alerts IS 'Stores alert configurations for SEO monitoring';
COMMENT ON TABLE analytics_alert_history IS 'Historical record of triggered alerts';
COMMENT ON TABLE analytics_exports IS 'Tracks data export operations and file locations';
COMMENT ON TABLE analytics_keyword_rankings IS 'Tracks keyword ranking positions over time';
COMMENT ON TABLE analytics_competitors IS 'Stores competitor domains for comparative analysis';
COMMENT ON TABLE analytics_backlinks IS 'Tracks backlink profile for the site';
