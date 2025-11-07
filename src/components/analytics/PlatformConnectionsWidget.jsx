/**
 * Platform Connections Widget
 * Displays and manages OAuth connections to analytics platforms
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Plus,
  ExternalLink
} from 'lucide-react';
import { analyticsOAuthService } from '../../utils/AnalyticsOAuthService';

const PLATFORM_INFO = {
  google_analytics: {
    name: 'Google Analytics',
    description: 'GA4 traffic and user behavior data',
    icon: '📊',
    color: 'from-orange-500 to-red-600'
  },
  google_search_console: {
    name: 'Google Search Console',
    description: 'Search performance and indexing data',
    icon: '🔍',
    color: 'from-blue-500 to-indigo-600'
  },
  bing_webmaster: {
    name: 'Bing Webmaster',
    description: 'Bing search performance data',
    icon: '🅱️',
    color: 'from-green-500 to-emerald-600'
  },
  yandex_webmaster: {
    name: 'Yandex Webmaster',
    description: 'Yandex search data and site health',
    icon: '🇷🇺',
    color: 'from-purple-500 to-violet-600'
  }
};

const PlatformConnectionsWidget = ({ connections, onRefresh, userId }) => {
  const [connecting, setConnecting] = useState(null);
  const [disconnecting, setDisconnecting] = useState(null);

  const handleConnect = async (platform) => {
    setConnecting(platform);
    try {
      await analyticsOAuthService.initiateOAuthFlow(platform);
      await onRefresh();
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      alert(`Failed to connect to ${platform}: ${error.message}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId, platform) => {
    if (!confirm(`Are you sure you want to disconnect from ${PLATFORM_INFO[platform]?.name}?`)) {
      return;
    }

    setDisconnecting(connectionId);
    try {
      await analyticsOAuthService.deleteConnection(connectionId);
      await onRefresh();
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert(`Failed to disconnect: ${error.message}`);
    } finally {
      setDisconnecting(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
      case 'expired':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'disconnected':
      default:
        return <XCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'expired':
        return 'Expired';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  // Group connections by platform
  const connectionsByPlatform = connections.reduce((acc, conn) => {
    if (!acc[conn.platform]) {
      acc[conn.platform] = [];
    }
    acc[conn.platform].push(conn);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
          <LinkIcon size={20} />
          Platform Connections
        </h2>
        <button
          onClick={onRefresh}
          className="text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PLATFORM_INFO).map(([platform, info]) => {
          const platformConnections = connectionsByPlatform[platform] || [];
          const isConnected = platformConnections.some(c => c.status === 'connected');
          const primaryConnection = platformConnections.find(c => c.status === 'connected') || platformConnections[0];

          return (
            <div
              key={platform}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <h3 className="font-medium text-white text-sm">{info.name}</h3>
                    {primaryConnection && (
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(primaryConnection.status)}
                        <span className="text-xs text-gray-400">
                          {getStatusText(primaryConnection.status)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4">{info.description}</p>

              {isConnected ? (
                <div className="space-y-2">
                  {primaryConnection.last_sync_at && (
                    <div className="text-xs text-gray-500">
                      Last synced: {new Date(primaryConnection.last_sync_at).toLocaleString()}
                    </div>
                  )}
                  {primaryConnection.last_error && (
                    <div className="text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
                      {primaryConnection.last_error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDisconnect(primaryConnection.id, platform)}
                      disabled={disconnecting === primaryConnection.id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                    >
                      {disconnecting === primaryConnection.id ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={12} />
                          Disconnect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform)}
                  disabled={connecting === platform}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r ${info.color} text-white text-sm rounded-lg transition-all hover:shadow-lg disabled:opacity-50`}
                >
                  {connecting === platform ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Connect
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {connections.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <p>
              💡 <strong>Tip:</strong> Enable automatic syncing for real-time data updates
            </p>
            <p>
              🔒 <strong>Security:</strong> Your OAuth tokens are encrypted and stored securely
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlatformConnectionsWidget;
