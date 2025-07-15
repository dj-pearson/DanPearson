import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://qazhdcqvjppbbjxzvisp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhemhkY3F2anBwYmJqeHp2aXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTM5NzEsImV4cCI6MjA2ODA4OTk3MX0.-axZYOX3tBQDUy2EWuG5kNvswOc4iRq0QMFcGkQeRlM'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Supabase Authentication Service
export class SupabaseAuthService {
  constructor() {
    this.supabase = supabase
  }

  // Authenticate user with email and password
  async authenticateUser(email, password) {
    try {
      // Find user by email
      const { data: user, error } = await this.supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        console.error('User lookup error:', error)
        return { success: false, error: 'Invalid email or password' }
      }

      // Check if account is locked
      if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
        return { success: false, error: 'Account is temporarily locked. Please try again later.' }
      }

      // Check password (in production, use bcrypt.compare)
      const isValidPassword = password === user.password_hash
      
      if (!isValidPassword) {
        // Increment failed login attempts
        const newFailedAttempts = user.failed_login_attempts + 1
        const lockUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes after 5 failed attempts

        await this.supabase
          .from('admin_users')
          .update({ 
            failed_login_attempts: newFailedAttempts,
            account_locked_until: lockUntil?.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (lockUntil) {
          return { success: false, error: 'Too many failed attempts. Account locked for 15 minutes.' }
        }

        return { success: false, error: 'Invalid email or password' }
      }

      // Reset failed attempts and update last login
      await this.supabase
        .from('admin_users')
        .update({ 
          failed_login_attempts: 0,
          account_locked_until: null,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return { 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          twoFactorEnabled: user.two_factor_enabled || false
        } 
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  // Create admin session
  async createSession(userId, ipAddress = '', userAgent = '') {
    try {
      const sessionToken = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      const { error } = await this.supabase
        .from('admin_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent
        })

      if (error) {
        console.error('Error creating session:', error)
        return { success: false, error: 'Failed to create session' }
      }

      return { success: true, sessionToken, expiresAt }
    } catch (error) {
      console.error('Error creating session:', error)
      return { success: false, error: 'Failed to create session' }
    }
  }

  // Validate admin session
  async validateSession(sessionToken) {
    try {
      const { data, error } = await this.supabase
        .from('admin_sessions')
        .select(`
          *,
          admin_users!inner(id, username, email, two_factor_enabled)
        `)
        .eq('session_token', sessionToken)
        .single()

      if (error || !data) {
        return { valid: false, error: 'Invalid session' }
      }

      if (new Date(data.expires_at) < new Date()) {
        // Clean up expired session
        await this.destroySession(sessionToken)
        return { valid: false, error: 'Session expired' }
      }

      return { 
        valid: true, 
        user: {
          id: data.admin_users.id,
          username: data.admin_users.username,
          email: data.admin_users.email,
          twoFactorEnabled: data.admin_users.two_factor_enabled || false
        }
      }
    } catch (error) {
      console.error('Error validating session:', error)
      return { valid: false, error: 'Invalid session' }
    }
  }

  // Destroy admin session
  async destroySession(sessionToken) {
    try {
      const { error } = await this.supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken)

      if (error) {
        console.error('Error destroying session:', error)
        return { success: false, error: 'Failed to destroy session' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error destroying session:', error)
      return { success: false, error: 'Failed to destroy session' }
    }
  }

  // Generate password reset token
  async generateResetToken(email) {
    try {
      // Find user by email
      const { data: user, error: userError } = await this.supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !user) {
        return { success: false, error: 'User not found' }
      }

      const token = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store token in database
      const { error } = await this.supabase
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString()
        })

      if (error) {
        console.error('Error storing reset token:', error)
        return { success: false, error: 'Failed to generate reset token' }
      }

      return { success: true, token, expiresAt }
    } catch (error) {
      console.error('Error generating reset token:', error)
      return { success: false, error: 'Failed to generate reset token' }
    }
  }

  // Validate reset token
  async validateResetToken(token) {
    try {
      const { data, error } = await this.supabase
        .from('password_reset_tokens')
        .select(`
          *,
          admin_users!inner(email)
        `)
        .eq('token', token)
        .eq('used', false)
        .single()

      if (error || !data) {
        return { valid: false, error: 'Invalid reset token' }
      }

      if (new Date(data.expires_at) < new Date()) {
        return { valid: false, error: 'Reset token has expired' }
      }

      return { valid: true, email: data.admin_users.email, userId: data.user_id }
    } catch (error) {
      console.error('Error validating reset token:', error)
      return { valid: false, error: 'Invalid reset token' }
    }
  }

  // Mark reset token as used
  async markTokenAsUsed(token) {
    try {
      const { error } = await this.supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token)

      if (error) {
        console.error('Error marking token as used:', error)
      }
    } catch (error) {
      console.error('Error marking token as used:', error)
    }
  }

  // Update user password
  async updatePassword(userId, newPassword) {
    try {
      // For demo purposes, store plain text password
      // In production, use bcrypt.hash(newPassword, 10)
      const { error } = await this.supabase
        .from('admin_users')
        .update({ 
          password_hash: newPassword, // In production: await bcrypt.hash(newPassword, 10)
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating password:', error)
        return { success: false, error: 'Failed to update password' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating password:', error)
      return { success: false, error: 'Failed to update password' }
    }
  }

  // Clean up expired sessions and tokens
  async cleanupExpiredData() {
    try {
      const now = new Date().toISOString()
      
      // Clean up expired sessions
      await this.supabase
        .from('admin_sessions')
        .delete()
        .lt('expires_at', now)

      // Clean up expired reset tokens
      await this.supabase
        .from('password_reset_tokens')
        .delete()
        .lt('expires_at', now)

      console.log('Expired data cleanup completed')
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }

  // Get user sessions
  async getUserSessions(userId) {
    try {
      const { data, error } = await this.supabase
        .from('admin_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user sessions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      return []
    }
  }

  // Revoke all user sessions except current
  async revokeOtherSessions(userId, currentSessionToken) {
    try {
      const { error } = await this.supabase
        .from('admin_sessions')
        .delete()
        .eq('user_id', userId)
        .neq('session_token', currentSessionToken)

      if (error) {
        console.error('Error revoking sessions:', error)
        return { success: false, error: 'Failed to revoke sessions' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error revoking sessions:', error)
      return { success: false, error: 'Failed to revoke sessions' }
    }
  }
}

// Create singleton instance
export const supabaseAuthService = new SupabaseAuthService()

export default supabaseAuthService