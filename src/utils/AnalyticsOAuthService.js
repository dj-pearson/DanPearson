/**
 * Analytics OAuth Service
 *
 * Handles OAuth authentication flows for multiple analytics platforms:
 * - Google (Analytics & Search Console)
 * - Microsoft Bing Webmaster Tools
 * - Yandex Webmaster
 *
 * This service manages token generation, exchange, refresh, and storage
 * using industry-standard OAuth 2.0 flows.
 */

import { supabase } from './SupabaseAuthService';

// OAuth Configuration for each platform
const OAUTH_CONFIGS = {
  google: {
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics',
      'https://www.googleapis.com/auth/webmasters'
    ],
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent'
  },

  microsoft: {
    authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: [
      'https://api.bing.microsoft.com/.default',
      'offline_access'
    ],
    responseType: 'code',
    prompt: 'select_account'
  },

  yandex: {
    authEndpoint: 'https://oauth.yandex.com/authorize',
    tokenEndpoint: 'https://oauth.yandex.com/token',
    scopes: [
      'webmaster:read',
      'webmaster:write'
    ],
    responseType: 'code',
    forceConfirm: 'yes'
  }
};

class AnalyticsOAuthService {
  constructor() {
    this.redirectUri = `${window.location.origin}/admin/analytics/oauth-callback`;
  }

  /**
   * Get OAuth configuration for a platform
   * @param {string} platform - Platform name (google, microsoft, yandex)
   * @returns {Object} OAuth configuration
   */
  getConfig(platform) {
    const config = OAUTH_CONFIGS[platform];
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return config;
  }

  /**
   * Get OAuth client credentials from environment variables or Supabase config
   * In production, these should be stored in Supabase secrets or environment variables
   * @param {string} platform - Platform name
   * @returns {Promise<Object>} Client credentials
   */
  async getClientCredentials(platform) {
    // For development, check environment variables
    // For production, you should store these in Supabase edge function secrets
    const credentials = {
      google: {
        clientId: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_SECRET
      },
      microsoft: {
        clientId: import.meta.env.VITE_MICROSOFT_OAUTH_CLIENT_ID,
        clientSecret: import.meta.env.VITE_MICROSOFT_OAUTH_CLIENT_SECRET
      },
      yandex: {
        clientId: import.meta.env.VITE_YANDEX_OAUTH_CLIENT_ID,
        clientSecret: import.meta.env.VITE_YANDEX_OAUTH_CLIENT_SECRET
      }
    };

    const creds = credentials[platform];
    if (!creds?.clientId) {
      throw new Error(`OAuth credentials not configured for ${platform}`);
    }

    return creds;
  }

  /**
   * Generate OAuth authorization URL
   * @param {string} platform - Platform name (google, microsoft, yandex)
   * @param {Object} options - Additional options
   * @returns {Promise<string>} Authorization URL
   */
  async generateAuthUrl(platform, options = {}) {
    const config = this.getConfig(platform);
    const credentials = await this.getClientCredentials(platform);

    // Generate state parameter for CSRF protection
    const state = this.generateState(platform);

    // Store state in session storage for verification
    sessionStorage.setItem(`oauth_state_${platform}`, state);

    const params = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: this.redirectUri,
      response_type: config.responseType,
      scope: config.scopes.join(' '),
      state,
      ...options
    });

    // Add platform-specific parameters
    if (platform === 'google') {
      params.append('access_type', config.accessType);
      params.append('prompt', config.prompt);
    } else if (platform === 'microsoft') {
      params.append('prompt', config.prompt);
    } else if (platform === 'yandex') {
      params.append('force_confirm', config.forceConfirm);
    }

    return `${config.authEndpoint}?${params.toString()}`;
  }

  /**
   * Generate a secure state parameter
   * @param {string} platform - Platform name
   * @returns {string} State parameter
   */
  generateState(platform) {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${platform}_${randomString}`;
  }

  /**
   * Verify state parameter
   * @param {string} state - State parameter from OAuth callback
   * @returns {boolean} Whether state is valid
   */
  verifyState(state) {
    const platform = state.split('_')[0];
    const storedState = sessionStorage.getItem(`oauth_state_${platform}`);
    sessionStorage.removeItem(`oauth_state_${platform}`);

    return storedState === state;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} platform - Platform name
   * @param {string} code - Authorization code
   * @returns {Promise<Object>} Token response
   */
  async exchangeCodeForToken(platform, code) {
    const config = this.getConfig(platform);
    const credentials = await this.getClientCredentials(platform);

    const body = new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      code,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code'
    });

    try {
      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
      }

      const tokenData = await response.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      };
    } catch (error) {
      console.error(`Error exchanging code for token (${platform}):`, error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} platform - Platform name
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token data
   */
  async refreshAccessToken(platform, refreshToken) {
    const config = this.getConfig(platform);
    const credentials = await this.getClientCredentials(platform);

    const body = new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    try {
      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
      }

      const tokenData = await response.json();

      return {
        accessToken: tokenData.access_token,
        // Some platforms don't return a new refresh token
        refreshToken: tokenData.refresh_token || refreshToken,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      };
    } catch (error) {
      console.error(`Error refreshing token (${platform}):`, error);
      throw error;
    }
  }

  /**
   * Save platform connection to database
   * @param {string} userId - User ID
   * @param {string} platform - Platform name
   * @param {Object} tokenData - Token data
   * @param {Object} accountInfo - Account information (accountId, propertyId, etc.)
   * @returns {Promise<Object>} Created connection
   */
  async saveConnection(userId, platform, tokenData, accountInfo = {}) {
    const expiresAt = new Date(Date.now() + (tokenData.expiresIn * 1000));

    const connectionData = {
      user_id: userId,
      platform,
      status: 'connected',
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
      token_expires_at: expiresAt.toISOString(),
      account_id: accountInfo.accountId,
      property_id: accountInfo.propertyId,
      config: accountInfo.config || {},
      last_sync_at: null,
      sync_enabled: true,
      error_count: 0
    };

    try {
      const { data, error } = await supabase
        .from('analytics_platform_connections')
        .upsert(connectionData, {
          onConflict: 'user_id,platform,property_id'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error saving connection:', error);
      throw error;
    }
  }

  /**
   * Get all connections for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of connections
   */
  async getConnections(userId) {
    try {
      const { data, error } = await supabase
        .from('analytics_platform_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw error;
    }
  }

  /**
   * Get a specific connection
   * @param {string} connectionId - Connection ID
   * @returns {Promise<Object>} Connection data
   */
  async getConnection(connectionId) {
    try {
      const { data, error } = await supabase
        .from('analytics_platform_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching connection:', error);
      throw error;
    }
  }

  /**
   * Update connection status
   * @param {string} connectionId - Connection ID
   * @param {string} status - New status
   * @param {string} errorMessage - Optional error message
   * @returns {Promise<Object>} Updated connection
   */
  async updateConnectionStatus(connectionId, status, errorMessage = null) {
    try {
      const updateData = { status };

      if (errorMessage) {
        updateData.last_error = errorMessage;
        updateData.error_count = supabase.raw('error_count + 1');
      } else {
        updateData.last_error = null;
        updateData.error_count = 0;
      }

      const { data, error } = await supabase
        .from('analytics_platform_connections')
        .update(updateData)
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating connection status:', error);
      throw error;
    }
  }

  /**
   * Delete a connection
   * @param {string} connectionId - Connection ID
   * @returns {Promise<void>}
   */
  async deleteConnection(connectionId) {
    try {
      const { error } = await supabase
        .from('analytics_platform_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  }

  /**
   * Get valid access token for a connection (refreshes if expired)
   * @param {string} connectionId - Connection ID
   * @returns {Promise<string>} Valid access token
   */
  async getValidAccessToken(connectionId) {
    const connection = await this.getConnection(connectionId);

    // Check if token is expired or will expire in the next 5 minutes
    const expiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt <= fiveMinutesFromNow) {
      // Token is expired or about to expire, refresh it
      console.log(`Refreshing token for connection ${connectionId}`);

      try {
        const newTokenData = await this.refreshAccessToken(
          connection.platform,
          connection.refresh_token
        );

        // Update connection with new token
        const newExpiresAt = new Date(Date.now() + (newTokenData.expiresIn * 1000));

        const { data, error } = await supabase
          .from('analytics_platform_connections')
          .update({
            access_token: newTokenData.accessToken,
            refresh_token: newTokenData.refreshToken,
            token_expires_at: newExpiresAt.toISOString(),
            status: 'connected',
            last_error: null,
            error_count: 0
          })
          .eq('id', connectionId)
          .select()
          .single();

        if (error) throw error;

        return newTokenData.accessToken;
      } catch (error) {
        // Token refresh failed, mark connection as error
        await this.updateConnectionStatus(
          connectionId,
          'error',
          `Token refresh failed: ${error.message}`
        );
        throw error;
      }
    }

    return connection.access_token;
  }

  /**
   * Fetch Google Analytics properties for an account
   * @param {string} accessToken - Valid access token
   * @returns {Promise<Array>} List of GA4 properties
   */
  async fetchGoogleAnalyticsProperties(accessToken) {
    try {
      // First, get accounts
      const accountsResponse = await fetch(
        'https://analyticsadmin.googleapis.com/v1beta/accounts',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!accountsResponse.ok) {
        throw new Error('Failed to fetch Google Analytics accounts');
      }

      const accountsData = await accountsResponse.json();
      const accounts = accountsData.accounts || [];

      // Fetch properties for each account
      const propertiesPromises = accounts.map(async (account) => {
        const propertiesResponse = await fetch(
          `https://analyticsadmin.googleapis.com/v1beta/${account.name}/properties`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json();
          return (propertiesData.properties || []).map(prop => ({
            accountId: account.name.split('/')[1],
            accountName: account.displayName,
            propertyId: prop.name.split('/')[1],
            propertyName: prop.displayName,
            propertyType: prop.propertyType
          }));
        }
        return [];
      });

      const propertiesArrays = await Promise.all(propertiesPromises);
      return propertiesArrays.flat();
    } catch (error) {
      console.error('Error fetching Google Analytics properties:', error);
      throw error;
    }
  }

  /**
   * Fetch Google Search Console sites
   * @param {string} accessToken - Valid access token
   * @returns {Promise<Array>} List of verified sites
   */
  async fetchSearchConsoleSites(accessToken) {
    try {
      const response = await fetch(
        'https://www.googleapis.com/webmasters/v3/sites',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Search Console sites');
      }

      const data = await response.json();
      return (data.siteEntry || []).map(site => ({
        siteUrl: site.siteUrl,
        permissionLevel: site.permissionLevel
      }));
    } catch (error) {
      console.error('Error fetching Search Console sites:', error);
      throw error;
    }
  }

  /**
   * Fetch Bing Webmaster sites
   * @param {string} accessToken - Valid access token
   * @returns {Promise<Array>} List of sites
   */
  async fetchBingWebmasterSites(accessToken) {
    try {
      const response = await fetch(
        'https://api.bing.microsoft.com/webmaster/v1/sites',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Bing Webmaster sites');
      }

      const data = await response.json();
      return data.d || [];
    } catch (error) {
      console.error('Error fetching Bing Webmaster sites:', error);
      throw error;
    }
  }

  /**
   * Fetch Yandex Webmaster hosts
   * @param {string} accessToken - Valid access token
   * @returns {Promise<Array>} List of hosts
   */
  async fetchYandexWebmasterHosts(accessToken) {
    try {
      const response = await fetch(
        'https://api.webmaster.yandex.net/v4/user',
        {
          headers: {
            'Authorization': `OAuth ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Yandex Webmaster user info');
      }

      const userData = await response.json();
      const userId = userData.user_id;

      // Get hosts for this user
      const hostsResponse = await fetch(
        `https://api.webmaster.yandex.net/v4/user/${userId}/hosts`,
        {
          headers: {
            'Authorization': `OAuth ${accessToken}`
          }
        }
      );

      if (!hostsResponse.ok) {
        throw new Error('Failed to fetch Yandex Webmaster hosts');
      }

      const hostsData = await hostsResponse.json();
      return hostsData.hosts || [];
    } catch (error) {
      console.error('Error fetching Yandex Webmaster hosts:', error);
      throw error;
    }
  }

  /**
   * Initiate OAuth flow by opening authorization URL
   * @param {string} platform - Platform name
   * @returns {Promise<void>}
   */
  async initiateOAuthFlow(platform) {
    try {
      const authUrl = await this.generateAuthUrl(platform);

      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        `oauth_${platform}`,
        `width=${width},height=${height},left=${left},top=${top},popup=yes`
      );

      if (!popup) {
        throw new Error('Failed to open OAuth popup. Please allow popups for this site.');
      }

      // Return a promise that resolves when OAuth completes
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Check if OAuth was successful
            const success = sessionStorage.getItem(`oauth_success_${platform}`);
            sessionStorage.removeItem(`oauth_success_${platform}`);

            if (success === 'true') {
              resolve();
            } else {
              reject(new Error('OAuth flow was cancelled or failed'));
            }
          }
        }, 500);
      });
    } catch (error) {
      console.error(`Error initiating OAuth flow for ${platform}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsOAuthService = new AnalyticsOAuthService();
export default analyticsOAuthService;
