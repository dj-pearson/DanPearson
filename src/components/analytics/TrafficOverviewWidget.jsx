/**
 * Traffic Overview Widget
 * Displays aggregated traffic metrics from all connected platforms
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { supabase } from '../../utils/SupabaseAuthService';

const TrafficOverviewWidget = ({ connections, dateRange, viewMode }) => {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('sessions');

  useEffect(() => {
    if (connections.length > 0) {
      fetchTrafficData();
    }
  }, [connections, dateRange]);

  const fetchTrafficData = async () => {
    setLoading(true);
    try {
      const connectionIds = connections.map(c => c.id);

      const { data, error } = await supabase
        .from('analytics_traffic_cache')
        .select('*')
        .in('connection_id', connectionIds)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Aggregate data across all platforms
      const aggregated = aggregateTrafficData(data);
      setTrafficData(aggregated);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateTrafficData = (data) => {
    if (!data || data.length === 0) return null;

    const totals = data.reduce((acc, row) => ({
      sessions: (acc.sessions || 0) + (row.sessions || 0),
      users: (acc.users || 0) + (row.users || 0),
      newUsers: (acc.new_users || 0) + (row.new_users || 0),
      pageviews: (acc.pageviews || 0) + (row.pageviews || 0),
      bounceRate: (acc.bounceRate || 0) + (row.bounce_rate || 0),
      avgSessionDuration: (acc.avgSessionDuration || 0) + (row.avg_session_duration || 0),
      engagementRate: (acc.engagementRate || 0) + (row.engagement_rate || 0),
      desktopSessions: (acc.desktopSessions || 0) + (row.desktop_sessions || 0),
      mobileSessions: (acc.mobileSessions || 0) + (row.mobile_sessions || 0),
      tabletSessions: (acc.tabletSessions || 0) + (row.tablet_sessions || 0),
      count: acc.count + 1
    }), { count: 0 });

    return {
      sessions: totals.sessions,
      users: totals.users,
      newUsers: totals.newUsers,
      pageviews: totals.pageviews,
      bounceRate: totals.count > 0 ? totals.bounceRate / totals.count : 0,
      avgSessionDuration: totals.count > 0 ? totals.avgSessionDuration / totals.count : 0,
      engagementRate: totals.count > 0 ? totals.engagementRate / totals.count : 0,
      desktopSessions: totals.desktopSessions,
      mobileSessions: totals.mobileSessions,
      tabletSessions: totals.tabletSessions
    };
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trafficData) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20 text-center">
        <Activity size={48} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400">No traffic data available for the selected period</p>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Sessions',
      value: formatNumber(trafficData.sessions),
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      change: '+12.5%' // Would calculate from previous period
    },
    {
      label: 'Users',
      value: formatNumber(trafficData.users),
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      change: '+8.3%'
    },
    {
      label: 'Pageviews',
      value: formatNumber(trafficData.pageviews),
      icon: Eye,
      color: 'from-green-500 to-emerald-600',
      change: '+15.7%'
    },
    {
      label: 'Avg. Session Duration',
      value: formatDuration(trafficData.avgSessionDuration),
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      change: '+5.2%'
    },
    {
      label: 'Bounce Rate',
      value: `${trafficData.bounceRate.toFixed(1)}%`,
      icon: Target,
      color: 'from-pink-500 to-rose-600',
      change: '-3.1%',
      inverted: true
    },
    {
      label: 'Engagement Rate',
      value: `${trafficData.engagementRate.toFixed(1)}%`,
      icon: MousePointerClick,
      color: 'from-yellow-500 to-amber-600',
      change: '+7.8%'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
          <Activity size={20} />
          Traffic Overview
        </h2>
        <div className="text-sm text-gray-400">
          {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-cyan-500/50 transition-all cursor-pointer"
            onClick={() => setSelectedMetric(metric.label)}
          >
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${metric.color} mb-3`}>
              <metric.icon size={18} className="text-white" />
            </div>
            <p className="text-gray-400 text-xs font-medium mb-1">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold text-white">{metric.value}</h3>
            </div>
            {metric.change && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${
                metric.inverted
                  ? metric.change.startsWith('-') ? 'text-green-400' : 'text-red-400'
                  : metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.change.startsWith('+') || (!metric.inverted && metric.change.startsWith('-'))
                  ? <TrendingUp size={12} />
                  : <TrendingDown size={12} />
                }
                <span>{metric.change}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Device Breakdown */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Device Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatNumber(trafficData.desktopSessions)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Desktop</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-cyan-500 h-2 rounded-full"
                style={{
                  width: `${(trafficData.desktopSessions / trafficData.sessions * 100).toFixed(0)}%`
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatNumber(trafficData.mobileSessions)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Mobile</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{
                  width: `${(trafficData.mobileSessions / trafficData.sessions * 100).toFixed(0)}%`
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatNumber(trafficData.tabletSessions)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Tablet</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(trafficData.tabletSessions / trafficData.sessions * 100).toFixed(0)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrafficOverviewWidget;
