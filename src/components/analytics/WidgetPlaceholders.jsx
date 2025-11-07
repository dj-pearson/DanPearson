/**
 * Placeholder widgets for Analytics Dashboard
 * These provide basic functionality and can be enhanced with real data
 */

import { motion } from 'framer-motion';
import {
  Search,
  Target,
  FileText,
  Activity,
  Globe,
  Smartphone,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const SearchPerformanceWidget = ({ connections, dateRange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
    >
      <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2 mb-6">
        <Search size={20} />
        Search Performance
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Total Impressions</p>
          <h3 className="text-2xl font-bold text-white">125.3K</h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
            <TrendingUp size={12} />
            <span>+15.2%</span>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Total Clicks</p>
          <h3 className="text-2xl font-bold text-white">8,524</h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
            <TrendingUp size={12} />
            <span>+8.7%</span>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Avg. CTR</p>
          <h3 className="text-2xl font-bold text-white">6.8%</h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
            <TrendingDown size={12} />
            <span>-2.1%</span>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">Avg. Position</p>
          <h3 className="text-2xl font-bold text-white">8.2</h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
            <TrendingUp size={12} />
            <span>Improved</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400 bg-gray-700 rounded p-3">
        📊 Connect to Search Console to view detailed query performance
      </div>
    </motion.div>
  );
};

export const KeywordRankingsWidget = ({ connections, dateRange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
    >
      <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2 mb-6">
        <Target size={20} />
        Keyword Rankings
      </h2>

      <div className="space-y-3">
        {['best seo tools 2024', 'analytics dashboard', 'traffic analysis'].map((keyword, i) => (
          <div key={i} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-white font-medium">{keyword}</h4>
              <p className="text-xs text-gray-400 mt-1">1,200 searches/mo</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400">Position</p>
                <p className="text-lg font-bold text-cyan-400">{3 + i}</p>
              </div>
              <div className={`text-xs ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                {i % 2 === 0 ? '↑ 2' : '↓ 1'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-400 bg-gray-700 rounded p-3 mt-4">
        🎯 Tracking top performing keywords across all search engines
      </div>
    </motion.div>
  );
};

export const PagePerformanceWidget = ({ connections, dateRange, viewMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
    >
      <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2 mb-6">
        <FileText size={20} />
        Page Performance
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
              <th className="pb-3">Page</th>
              <th className="pb-3">Views</th>
              <th className="pb-3">Clicks</th>
              <th className="pb-3">Avg. Position</th>
              <th className="pb-3">Change</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {['/blog/seo-guide', '/products/analytics', '/about'].map((page, i) => (
              <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="py-3 text-cyan-400">{page}</td>
                <td className="py-3 text-white">{(2500 - i * 500).toLocaleString()}</td>
                <td className="py-3 text-white">{(180 - i * 30).toLocaleString()}</td>
                <td className="py-3 text-white">{4 + i}</td>
                <td className={`py-3 ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {i % 2 === 0 ? '+12%' : '-5%'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export const SiteHealthWidget = ({ connections, dateRange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
    >
      <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2 mb-6">
        <Activity size={20} />
        Site Health
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white">Indexed Pages</span>
          </div>
          <span className="text-white font-bold">1,247</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-white">Crawl Errors</span>
          </div>
          <span className="text-white font-bold">3</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white">Mobile Usability</span>
          </div>
          <span className="text-white font-bold">Good</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white">Security Issues</span>
          </div>
          <span className="text-white font-bold">0</span>
        </div>
      </div>
    </motion.div>
  );
};

export const CoreWebVitalsWidget = ({ connections, dateRange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
    >
      <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2 mb-6">
        <Smartphone size={20} />
        Core Web Vitals
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">LCP (Largest Contentful Paint)</span>
            <span className="text-green-400 font-bold">1.8s</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Good - 85% of visits</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">FID (First Input Delay)</span>
            <span className="text-green-400 font-bold">45ms</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Good - 92% of visits</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">CLS (Cumulative Layout Shift)</span>
            <span className="text-yellow-400 font-bold">0.12</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Needs Improvement - 68% of visits</p>
        </div>
      </div>
    </motion.div>
  );
};

export const GeoDeviceWidget = ({ connections, dateRange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
    >
      <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2 mb-6">
        <Globe size={20} />
        Geographic & Device Breakdown
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {[
              { country: 'United States', code: 'US', sessions: 12500 },
              { country: 'United Kingdom', code: 'GB', sessions: 8300 },
              { country: 'Canada', code: 'CA', sessions: 5200 },
              { country: 'Australia', code: 'AU', sessions: 3800 }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getFlag(item.code)}</span>
                  <span className="text-white text-sm">{item.country}</span>
                </div>
                <span className="text-cyan-400 font-bold">{item.sessions.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Device Types</h3>
          <div className="space-y-3">
            {[
              { device: 'Desktop', sessions: 18500, icon: '💻' },
              { device: 'Mobile', sessions: 15200, icon: '📱' },
              { device: 'Tablet', sessions: 3100, icon: '📱' }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-white text-sm">{item.device}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">{item.sessions.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${(item.sessions / 36800 * 100).toFixed(0)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const AlertsWidget = ({ userId }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-4 border border-yellow-500/30"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="text-yellow-400 font-semibold mb-2">Active Alerts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Traffic drop detected on /blog/seo-guide</span>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function getFlag(code) {
  const flags = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦',
    'AU': '🇦🇺'
  };
  return flags[code] || '🌐';
}
