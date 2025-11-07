# SEO & Traffic Analytics Dashboard

## Overview

A comprehensive, enterprise-level analytics dashboard that unifies data from multiple analytics platforms into a single, intuitive interface. This dashboard provides deep insights into traffic, search performance, SEO metrics, and site health across all major search engines and analytics platforms.

## Features

### Multi-Platform Integration
- **Google Analytics (GA4)**: Traffic metrics, user behavior, conversion tracking
- **Google Search Console**: Search performance, keyword rankings, indexing status
- **Bing Webmaster Tools**: Bing search data and site health
- **Yandex Webmaster**: Yandex search performance and indexing

### Dashboard Capabilities

#### 1. Traffic Overview
- Total sessions, users, and pageviews
- Engagement metrics (bounce rate, session duration, engagement rate)
- Device breakdown (desktop, mobile, tablet)
- Real-time traffic sources analysis

#### 2. Search Performance
- Search impressions and clicks
- Click-through rate (CTR) analysis
- Average search position tracking
- Query-level performance data

#### 3. Keyword Rankings
- Track keyword positions across all search engines
- Position change monitoring
- Search volume and opportunity scores
- SERP feature tracking

#### 4. Page Performance
- Page-level traffic and engagement metrics
- Search performance per page
- Core Web Vitals (LCP, FID, CLS)
- Conversion tracking per page

#### 5. Site Health Monitoring
- Indexing status and coverage
- Crawl error detection
- Mobile usability issues
- Security issue alerts
- Structured data validation

#### 6. Geographic & Device Analytics
- Country-level traffic breakdown
- Device type distribution
- Regional performance trends

#### 7. Alerts & Notifications
- Automated SEO issue detection
- Traffic drop alerts
- Ranking change notifications
- Site health warnings

#### 8. Data Export
- Export to CSV, JSON, and PDF
- Custom date range selection
- Filtered data exports

## Setup Instructions

### 1. Database Migration

Run the database migration to create all necessary tables:

```bash
# Apply the migration
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20250107_analytics_dashboard_schema.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 2. OAuth Application Setup

#### Google (Analytics & Search Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable APIs:
   - Google Analytics Data API (GA4)
   - Google Analytics Admin API
   - Google Search Console API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - Add scopes: `analytics.readonly`, `webmasters.readonly`
   - Add test users if in development
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `https://yourdomain.com/admin/analytics/oauth-callback`
7. Copy Client ID and Client Secret

#### Microsoft (Bing Webmaster)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Configure:
   - Name: Your app name
   - Supported account types: Accounts in any organizational directory
   - Redirect URI: `https://yourdomain.com/admin/analytics/oauth-callback`
5. Go to "Certificates & secrets" → "New client secret"
6. Copy Application (client) ID and Client Secret value
7. Go to "API permissions" → "Add permission"
   - Add: `https://api.bing.microsoft.com/.default`

#### Yandex (Yandex Webmaster)

1. Go to [Yandex OAuth](https://oauth.yandex.com/client/new)
2. Fill in application details:
   - Name: Your app name
   - Platforms: Web services
   - Redirect URI: `https://yourdomain.com/admin/analytics/oauth-callback`
   - Permissions: `webmaster:read`, `webmaster:write`
3. Submit application
4. Copy Client ID and Client Secret

### 3. Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Fill in your OAuth credentials:

```env
# Google OAuth
VITE_GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
VITE_GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
VITE_MICROSOFT_OAUTH_CLIENT_ID=your-microsoft-client-id
VITE_MICROSOFT_OAUTH_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_OAUTH_CLIENT_ID=your-microsoft-client-id
MICROSOFT_OAUTH_CLIENT_SECRET=your-microsoft-client-secret

# Yandex OAuth
VITE_YANDEX_OAUTH_CLIENT_ID=your-yandex-client-id
VITE_YANDEX_OAUTH_CLIENT_SECRET=your-yandex-client-secret
YANDEX_OAUTH_CLIENT_ID=your-yandex-client-id
YANDEX_OAUTH_CLIENT_SECRET=your-yandex-client-secret
```

**Note:** Variables prefixed with `VITE_` are used in the frontend, while unprefixed versions are used in Supabase Edge Functions.

### 4. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Deploy all edge functions
supabase functions deploy google-analytics-sync
supabase functions deploy google-search-console-sync
supabase functions deploy bing-webmaster-sync
supabase functions deploy yandex-webmaster-sync
```

Set edge function secrets:

```bash
# Google OAuth
supabase secrets set GOOGLE_OAUTH_CLIENT_ID=your-client-id
supabase secrets set GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret

# Microsoft OAuth
supabase secrets set MICROSOFT_OAUTH_CLIENT_ID=your-client-id
supabase secrets set MICROSOFT_OAUTH_CLIENT_SECRET=your-client-secret

# Yandex OAuth
supabase secrets set YANDEX_OAUTH_CLIENT_ID=your-client-id
supabase secrets set YANDEX_OAUTH_CLIENT_SECRET=your-client-secret
```

## Usage Guide

### Connecting Platforms

1. Navigate to `/admin/analytics` in your admin panel
2. Click "Connect" on any platform card
3. Authorize access in the OAuth popup window
4. Select the properties/sites you want to track
5. Data will begin syncing automatically

### Viewing Analytics

#### Date Range Selection
- Use preset ranges (7 days, 30 days, 90 days, etc.)
- Or select custom date ranges
- All widgets update based on the selected range

#### View Modes
- **Overview**: High-level summary of all metrics
- **Detailed**: In-depth analysis with charts and tables
- **Comparison**: Side-by-side platform comparison

### Data Synchronization

Data syncs automatically based on the configured frequency (default: hourly). You can also manually trigger syncs:

1. Click "Refresh All" button in the dashboard header
2. Or configure individual platform sync frequencies in connection settings

### Setting Up Alerts

1. Navigate to Alerts widget
2. Click "Create Alert"
3. Configure:
   - Alert type (traffic drop, ranking change, etc.)
   - Threshold values
   - Notification channels (email, webhook, Slack)
   - Frequency (immediate, daily, weekly)

### Exporting Data

1. Click "Export" button in dashboard header
2. Select:
   - Data type (traffic, search queries, page performance, etc.)
   - Format (CSV, JSON, PDF)
   - Date range
   - Filters
3. Download generated file

## Architecture

### Frontend Components

```
src/
├── pages/admin/
│   ├── AnalyticsDashboard.jsx       # Main dashboard page
│   └── OAuthCallback.jsx             # OAuth redirect handler
├── components/analytics/
│   ├── PlatformConnectionsWidget.jsx # OAuth connection management
│   ├── TrafficOverviewWidget.jsx     # Traffic metrics display
│   ├── SearchPerformanceWidget.jsx   # Search performance data
│   ├── KeywordRankingsWidget.jsx     # Keyword tracking
│   ├── PagePerformanceWidget.jsx     # Page-level analytics
│   ├── SiteHealthWidget.jsx          # Site health monitoring
│   ├── CoreWebVitalsWidget.jsx       # Core Web Vitals
│   ├── GeoDeviceWidget.jsx           # Geographic & device data
│   ├── DateRangeSelector.jsx         # Date range picker
│   └── AlertsWidget.jsx              # Alerts display
└── utils/
    └── AnalyticsOAuthService.js      # OAuth service layer
```

### Backend (Supabase Edge Functions)

```
supabase/functions/
├── google-analytics-sync/        # GA4 data fetching
├── google-search-console-sync/   # Search Console data fetching
├── bing-webmaster-sync/          # Bing Webmaster data fetching
└── yandex-webmaster-sync/        # Yandex Webmaster data fetching
```

### Database Tables

- `analytics_platform_connections`: OAuth credentials and connection status
- `analytics_traffic_cache`: Aggregated traffic metrics
- `analytics_search_queries`: Search query performance data
- `analytics_page_performance`: Page-level metrics
- `analytics_site_health`: Site health and indexing status
- `analytics_keyword_rankings`: Keyword position tracking
- `analytics_alerts`: Alert configurations
- `analytics_alert_history`: Triggered alerts history
- `analytics_exports`: Export operation tracking

## Security Considerations

### OAuth Token Storage
- Tokens are encrypted at rest in Supabase
- Access tokens are automatically refreshed before expiration
- Row Level Security (RLS) ensures users only see their own data

### API Rate Limiting
- Edge functions implement rate limiting to prevent API quota exhaustion
- Automatic retry logic with exponential backoff
- Error tracking and notification

### Data Privacy
- No personal user data is stored beyond what's necessary
- All data transfers use HTTPS/TLS encryption
- GDPR-compliant data handling

## Troubleshooting

### OAuth Connection Fails
- Verify redirect URI matches exactly in OAuth app settings
- Check that all required API scopes are enabled
- Ensure OAuth credentials are correctly set in environment variables

### No Data Showing
- Verify platforms are connected and status is "Connected"
- Check last sync time - may need to trigger manual refresh
- Review edge function logs for any errors

### Token Expired Errors
- Refresh tokens should auto-renew, but may need to reconnect
- Check token expiration in `analytics_platform_connections` table
- Re-authorize the platform connection

## API Documentation

### Edge Function Endpoints

All edge functions follow this pattern:

```typescript
POST /functions/v1/{function-name}

Request Body:
{
  "connectionId": "uuid",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "propertyId": "property-or-site-id"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

## Roadmap

### Planned Features
- [ ] Competitor analysis integration
- [ ] Backlink tracking (Ahrefs/SEMrush integration)
- [ ] Advanced forecasting with ML
- [ ] Custom dashboard widgets
- [ ] White-label reporting
- [ ] API access for external integrations
- [ ] Mobile app
- [ ] Slack/Discord integration
- [ ] Advanced anomaly detection

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase edge function logs
3. Check browser console for frontend errors
4. Review database RLS policies if access issues occur

## License

This analytics dashboard is part of the DanPearson project and follows the same license terms.
