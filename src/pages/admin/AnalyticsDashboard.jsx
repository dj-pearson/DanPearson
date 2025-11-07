/**
 * Analytics Dashboard - Unified SEO & Traffic Analytics
 *
 * Integrates data from multiple platforms:
 * - Google Analytics (GA4)
 * - Google Search Console
 * - Bing Webmaster Tools
 * - Yandex Webmaster
 *
 * Provides comprehensive insights for SEO and traffic analysis
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../../contexts/AdminContext';
import { analyticsOAuthService } from '../../utils/AnalyticsOAuthService';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Globe,
  Activity,
  AlertTriangle,
  CheckCircle,
  Users,
  Eye,
  MousePointerClick,
  FileText,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Download,
  Settings,
  Link as LinkIcon,
  MapPin,
  Clock,
  Zap,
  Target
} from 'lucide-react';

import TrafficOverviewWidget from '../../components/analytics/TrafficOverviewWidget';
import {
  SearchPerformanceWidget,
  KeywordRankingsWidget,
  PagePerformanceWidget,
  SiteHealthWidget,
  CoreWebVitalsWidget,
  GeoDeviceWidget,
  AlertsWidget
} from '../../components/analytics/WidgetPlaceholders';
import PlatformConnectionsWidget from '../../components/analytics/PlatformConnectionsWidget';
import DateRangeSelector from '../../components/analytics/DateRangeSelector';

const AnalyticsDashboard = () => {
  const { user } = useAdmin();

  // State management
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    preset: '30d'
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState(['all']);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed', 'comparison'

  // Fetch connections on mount
  useEffect(() => {
    if (user?.id) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await analyticsOAuthService.getConnections(user.id);
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      // Trigger sync for all connected platforms
      // This would call the edge functions for each connection
      await Promise.all(
        connections
          .filter(c => c.status === 'connected' && c.sync_enabled)
          .map(connection => syncPlatformData(connection))
      );

      // Refresh connections to get updated sync times
      await fetchConnections();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const syncPlatformData = async (connection) => {
    // Call the appropriate edge function based on platform
    const edgeFunctions = {
      google_analytics: 'google-analytics-sync',
      google_search_console: 'google-search-console-sync',
      bing_webmaster: 'bing-webmaster-sync',
      yandex_webmaster: 'yandex-webmaster-sync'
    };

    const functionName = edgeFunctions[connection.platform];
    if (!functionName) return;

    // Call Supabase edge function
    // This is a placeholder - you'd implement the actual API call
    console.log(`Syncing ${connection.platform}...`);
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  // Quick stats calculation
  const quickStats = [
    {
      label: 'Connected Platforms',
      value: connections.filter(c => c.status === 'connected').length,
      total: 4,
      icon: LinkIcon,
      color: 'from-cyan-500 to-blue-600',
      trend: connections.filter(c => c.status === 'connected').length > 0 ? 'up' : 'neutral'
    },
    {
      label: 'Active Alerts',
      value: 0, // Would come from alerts table
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-600',
      trend: 'neutral'
    },
    {
      label: 'Last Sync',
      value: connections.length > 0
        ? getLastSyncTime(connections)
        : 'Never',
      icon: RefreshCw,
      color: 'from-green-500 to-emerald-600',
      trend: 'neutral',
      isTime: true
    },
    {
      label: 'Data Quality',
      value: calculateDataQuality(connections),
      icon: CheckCircle,
      color: 'from-purple-500 to-violet-600',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 size={32} className="text-cyan-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Unified view of your SEO performance and traffic analytics
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            disabled={refreshing || connections.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Syncing...' : 'Refresh All'}
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Download size={18} />
            Export
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-bold text-white">
                    {stat.isTime ? stat.value : stat.value}
                  </h3>
                  {stat.total && (
                    <span className="text-gray-500 text-sm">/ {stat.total}</span>
                  )}
                </div>
                {stat.trend && stat.trend !== 'neutral' && (
                  <div className={`flex items-center gap-1 mt-2 ${
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs">
                      {stat.trend === 'up' ? 'Good' : 'Attention needed'}
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Platform Connections Status */}
      <PlatformConnectionsWidget
        connections={connections}
        onRefresh={fetchConnections}
        userId={user?.id}
      />

      {/* Date Range and View Mode Selector */}
      <div className="flex items-center justify-between bg-gray-800 rounded-xl p-4 border border-cyan-500/20">
        <DateRangeSelector
          dateRange={dateRange}
          onChange={setDateRange}
        />

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm mr-2">View:</span>
          {['overview', 'detailed', 'comparison'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Widget */}
      {connections.length > 0 && (
        <AlertsWidget userId={user?.id} />
      )}

      {/* Main Content */}
      {connections.filter(c => c.status === 'connected').length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-xl p-12 border border-cyan-500/20 text-center"
        >
          <Globe size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Analytics Platforms
          </h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Get started by connecting your analytics platforms. We support Google Analytics,
            Search Console, Bing Webmaster Tools, and Yandex Webmaster to give you a complete
            view of your traffic and SEO performance.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Traffic Overview */}
          <TrafficOverviewWidget
            connections={connections.filter(c => c.status === 'connected')}
            dateRange={dateRange}
            viewMode={viewMode}
          />

          {/* Search Performance and Keywords - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SearchPerformanceWidget
              connections={connections.filter(c =>
                c.status === 'connected' &&
                (c.platform === 'google_search_console' || c.platform === 'bing_webmaster' || c.platform === 'yandex_webmaster')
              )}
              dateRange={dateRange}
            />

            <KeywordRankingsWidget
              connections={connections.filter(c => c.status === 'connected')}
              dateRange={dateRange}
            />
          </div>

          {/* Page Performance */}
          <PagePerformanceWidget
            connections={connections.filter(c => c.status === 'connected')}
            dateRange={dateRange}
            viewMode={viewMode}
          />

          {/* Site Health and Core Web Vitals - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SiteHealthWidget
              connections={connections.filter(c => c.status === 'connected')}
              dateRange={dateRange}
            />

            <CoreWebVitalsWidget
              connections={connections.filter(c => c.status === 'connected')}
              dateRange={dateRange}
            />
          </div>

          {/* Geographic and Device Breakdown */}
          <GeoDeviceWidget
            connections={connections.filter(c => c.status === 'connected')}
            dateRange={dateRange}
          />
        </>
      )}
    </div>
  );
};

// Helper functions
function getLastSyncTime(connections) {
  const connected = connections.filter(c => c.status === 'connected' && c.last_sync_at);
  if (connected.length === 0) return 'Never';

  const mostRecent = connected.reduce((latest, conn) => {
    const connTime = new Date(conn.last_sync_at);
    return connTime > latest ? connTime : latest;
  }, new Date(0));

  const now = new Date();
  const diffMinutes = Math.floor((now - mostRecent) / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function calculateDataQuality(connections) {
  const connected = connections.filter(c => c.status === 'connected');
  if (connected.length === 0) return 'N/A';

  const withRecentData = connected.filter(c => {
    if (!c.last_sync_at) return false;
    const syncTime = new Date(c.last_sync_at);
    const hoursSinceSync = (Date.now() - syncTime) / (1000 * 60 * 60);
    return hoursSinceSync < 24; // Recent data = synced in last 24 hours
  });

  const percentage = Math.round((withRecentData.length / connected.length) * 100);

  if (percentage >= 90) return 'Excellent';
  if (percentage >= 70) return 'Good';
  if (percentage >= 50) return 'Fair';
  return 'Poor';
}

export default AnalyticsDashboard;
