/**
 * OAuth Callback Handler
 * Handles OAuth redirects from analytics platforms
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { analyticsOAuthService } from '../../utils/AnalyticsOAuthService';
import { useAdmin } from '../../contexts/AdminContext';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAdmin();

  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Processing OAuth callback...');
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get parameters from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for OAuth errors
      if (error) {
        throw new Error(errorDescription || error);
      }

      // Verify required parameters
      if (!code || !state) {
        throw new Error('Missing required OAuth parameters');
      }

      // Verify state to prevent CSRF attacks
      if (!analyticsOAuthService.verifyState(state)) {
        throw new Error('Invalid state parameter. Possible CSRF attack.');
      }

      // Extract platform from state
      const platformName = state.split('_')[0];
      setPlatform(platformName);

      // Exchange code for tokens
      setMessage(`Connecting to ${platformName}...`);
      const tokenData = await analyticsOAuthService.exchangeCodeForToken(
        platformName,
        code
      );

      // Fetch account information based on platform
      let accountInfo = {};
      setMessage('Fetching account information...');

      if (platformName === 'google') {
        // Could be Analytics or Search Console - need to determine
        // For now, we'll fetch both properties and sites
        try {
          const properties = await analyticsOAuthService.fetchGoogleAnalyticsProperties(
            tokenData.accessToken
          );
          const sites = await analyticsOAuthService.fetchSearchConsoleSites(
            tokenData.accessToken
          );

          // Store both - user can select which to use
          accountInfo = {
            analyticsProperties: properties,
            searchConsoleSites: sites
          };
        } catch (err) {
          console.error('Error fetching Google account info:', err);
        }
      } else if (platformName === 'microsoft') {
        const sites = await analyticsOAuthService.fetchBingWebmasterSites(
          tokenData.accessToken
        );
        accountInfo = { sites };
      } else if (platformName === 'yandex') {
        const hosts = await analyticsOAuthService.fetchYandexWebmasterHosts(
          tokenData.accessToken
        );
        accountInfo = { hosts };
      }

      // For Google, we need to save separate connections for Analytics and Search Console
      if (platformName === 'google') {
        // Save Google Analytics connections
        if (accountInfo.analyticsProperties && accountInfo.analyticsProperties.length > 0) {
          for (const property of accountInfo.analyticsProperties) {
            await analyticsOAuthService.saveConnection(
              user.id,
              'google_analytics',
              tokenData,
              {
                accountId: property.accountId,
                propertyId: property.propertyId,
                config: {
                  accountName: property.accountName,
                  propertyName: property.propertyName
                }
              }
            );
          }
        }

        // Save Google Search Console connections
        if (accountInfo.searchConsoleSites && accountInfo.searchConsoleSites.length > 0) {
          for (const site of accountInfo.searchConsoleSites) {
            await analyticsOAuthService.saveConnection(
              user.id,
              'google_search_console',
              tokenData,
              {
                propertyId: site.siteUrl,
                config: {
                  permissionLevel: site.permissionLevel
                }
              }
            );
          }
        }
      } else {
        // Save single connection for other platforms
        const firstItem = accountInfo.sites?.[0] || accountInfo.hosts?.[0];
        if (firstItem) {
          await analyticsOAuthService.saveConnection(
            user.id,
            platformName === 'microsoft' ? 'bing_webmaster' : 'yandex_webmaster',
            tokenData,
            {
              propertyId: firstItem.Url || firstItem.host_id,
              config: accountInfo
            }
          );
        }
      }

      // Mark as successful
      setStatus('success');
      setMessage('Successfully connected! Redirecting...');

      // Store success flag for parent window
      sessionStorage.setItem(`oauth_success_${platformName}`, 'true');

      // Close popup or redirect after 2 seconds
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          navigate('/admin/analytics');
        }
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to complete OAuth connection');

      // Close popup or redirect after 5 seconds
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          navigate('/admin/analytics');
        }
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-cyan-500/20">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <RefreshCw size={48} className="mx-auto text-cyan-400 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Processing...</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            </>
          )}

          <p className="text-gray-300">{message}</p>

          {platform && (
            <p className="text-sm text-gray-400 mt-4">
              Platform: <span className="text-cyan-400">{platform}</span>
            </p>
          )}

          {status === 'error' && (
            <button
              onClick={() => navigate('/admin/analytics')}
              className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
