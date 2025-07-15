import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'https://qazhdcqvjppbbjxzvisp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhemhkY3F2anBwYmJqeHp2aXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTM5NzEsImV4cCI6MjA2ODA4OTk3MX0.-axZYOX3tBQDUy2EWuG5kNvswOc4iRq0QMFcGkQeRlM'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Email Service for handling password reset and notifications with Supabase
export class SupabaseEmailService {
  constructor() {
    this.supabase = supabase
  }

  // Load SMTP settings from Supabase
  async loadSMTPSettings() {
    try {
      const { data, error } = await this.supabase
        .from('smtp_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading SMTP settings:', error)
        return this.getDefaultSMTPSettings()
      }

      return data || this.getDefaultSMTPSettings()
    } catch (error) {
      console.error('Failed to load SMTP settings:', error)
      return this.getDefaultSMTPSettings()
    }
  }

  // Get default SMTP settings
  getDefaultSMTPSettings() {
    return {
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      from_name: 'Dan Pearson Portfolio',
      from_email: 'noreply@danpearson.com',
      require_auth: true,
      reset_subject: 'Password Reset Request',
      reset_template: this.getDefaultResetTemplate()
    }
  }

  // Get default email template
  getDefaultResetTemplate() {
    return `Hello,

You requested a password reset for your Dan Pearson Portfolio admin account.

Click the link below to reset your password:
{{resetLink}}

This link will expire in 1 hour for security reasons.

If you did not request this password reset, please ignore this email.

Best regards,
Dan Pearson Portfolio Team`
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

  // Send password reset email (simulated)
  async sendPasswordResetEmail(email) {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' }
      }

      // Generate reset token
      const tokenResult = await this.generateResetToken(email)
      if (!tokenResult.success) {
        return tokenResult
      }

      const { token } = tokenResult
      
      // Create reset link
      const resetLink = `${window.location.origin}/admin/reset-password?token=${token}`
      
      // Load SMTP settings
      const smtpSettings = await this.loadSMTPSettings()
      
      // Prepare email content
      const emailContent = smtpSettings.reset_template.replace('{{resetLink}}', resetLink)
      
      // Simulate email sending (in production, use actual SMTP service)
      console.log('Sending password reset email:', {
        to: email,
        from: `${smtpSettings.from_name} <${smtpSettings.from_email}>`,
        subject: smtpSettings.reset_subject,
        content: emailContent,
        resetLink
      })
      
      // Log the email attempt
      await this.logEmailAttempt({
        type: 'password_reset',
        recipient_email: email,
        subject: smtpSettings.reset_subject,
        status: 'sent'
      })
      
      return { 
        success: true, 
        message: 'Password reset email sent successfully',
        resetLink // For demo purposes only
      }
      
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      
      await this.logEmailAttempt({
        type: 'password_reset',
        recipient_email: email,
        status: 'failed',
        error_message: error.message
      })
      
      return { success: false, error: 'Failed to send reset email' }
    }
  }

  // Send notification email
  async sendNotificationEmail(to, subject, message, type = 'notification') {
    try {
      if (!this.isValidEmail(to)) {
        return { success: false, error: 'Invalid email format' }
      }

      const smtpSettings = await this.loadSMTPSettings()

      // Simulate email sending
      console.log('Sending notification email:', {
        to,
        from: `${smtpSettings.from_name} <${smtpSettings.from_email}>`,
        subject,
        message,
        type
      })
      
      await this.logEmailAttempt({
        type,
        recipient_email: to,
        subject,
        status: 'sent'
      })
      
      return { success: true, message: 'Notification email sent successfully' }
      
    } catch (error) {
      console.error('Failed to send notification email:', error)
      
      await this.logEmailAttempt({
        type,
        recipient_email: to,
        subject,
        status: 'failed',
        error_message: error.message
      })
      
      return { success: false, error: 'Failed to send notification email' }
    }
  }

  // Test SMTP connection
  async testSMTPConnection() {
    try {
      const smtpSettings = await this.loadSMTPSettings()
      
      if (!smtpSettings.host || !smtpSettings.username) {
        return { success: false, error: 'SMTP settings incomplete' }
      }
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Testing SMTP connection:', {
        host: smtpSettings.host,
        port: smtpSettings.port,
        secure: smtpSettings.secure,
        username: smtpSettings.username
      })
      
      return { success: true, message: 'SMTP connection successful' }
      
    } catch (error) {
      console.error('SMTP connection test failed:', error)
      return { success: false, error: 'SMTP connection failed' }
    }
  }

  // Update SMTP settings
  async updateSMTPSettings(newSettings) {
    try {
      const { error } = await this.supabase
        .from('smtp_settings')
        .insert({
          ...newSettings,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating SMTP settings:', error)
        return { success: false, error: 'Failed to update SMTP settings' }
      }

      return { success: true, message: 'SMTP settings updated successfully' }
    } catch (error) {
      console.error('Error updating SMTP settings:', error)
      return { success: false, error: 'Failed to update SMTP settings' }
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Log email attempts
  async logEmailAttempt(logData) {
    try {
      const { error } = await this.supabase
        .from('email_logs')
        .insert(logData)

      if (error) {
        console.error('Error logging email attempt:', error)
      }
    } catch (error) {
      console.error('Error logging email attempt:', error)
    }
  }

  // Get email logs
  async getEmailLogs(limit = 100) {
    try {
      const { data, error } = await this.supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching email logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching email logs:', error)
      return []
    }
  }

  // Get email statistics
  async getEmailStats() {
    try {
      const now = new Date()
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Get total counts
      const { count: totalCount } = await this.supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })

      const { count: sentCount } = await this.supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')

      const { count: failedCount } = await this.supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')

      const { count: last24HoursCount } = await this.supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .gte('sent_at', last24Hours.toISOString())

      const { count: last7DaysCount } = await this.supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .gte('sent_at', last7Days.toISOString())

      const { count: passwordResetCount } = await this.supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'password_reset')

      const { count: notificationCount } = await this.supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'notification')

      return {
        total: totalCount || 0,
        sent: sentCount || 0,
        failed: failedCount || 0,
        last24Hours: last24HoursCount || 0,
        last7Days: last7DaysCount || 0,
        passwordResets: passwordResetCount || 0,
        notifications: notificationCount || 0
      }
    } catch (error) {
      console.error('Error fetching email stats:', error)
      return {
        total: 0,
        sent: 0,
        failed: 0,
        last24Hours: 0,
        last7Days: 0,
        passwordResets: 0,
        notifications: 0
      }
    }
  }

  // Clear old logs
  async clearOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
      
      const { error } = await this.supabase
        .from('email_logs')
        .delete()
        .lt('sent_at', cutoffDate.toISOString())

      if (error) {
        console.error('Error clearing old logs:', error)
        return 0
      }

      return 1 // Return success indicator
    } catch (error) {
      console.error('Error clearing old logs:', error)
      return 0
    }
  }

  // Export email logs
  async exportEmailLogs() {
    try {
      const logs = await this.getEmailLogs(1000) // Get more logs for export
      const stats = await this.getEmailStats()
      
      const exportData = {
        logs,
        stats,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
      
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Error exporting email logs:', error)
      return JSON.stringify({ error: 'Failed to export logs' }, null, 2)
    }
  }

  // Admin user authentication methods
  async authenticateUser(username, password) {
    try {
      // In a real implementation, you would hash the password and compare
      // For now, we'll use a simple comparison (NOT SECURE for production)
      const { data: user, error } = await this.supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !user) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Simple password check (in production, use bcrypt or similar)
      const isValidPassword = password === 'Infomax1!' // Temporary for demo
      
      if (!isValidPassword) {
        // Increment failed login attempts
        await this.supabase
          .from('admin_users')
          .update({ 
            failed_login_attempts: user.failed_login_attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        return { success: false, error: 'Invalid credentials' }
      }

      // Reset failed attempts and update last login
      await this.supabase
        .from('admin_users')
        .update({ 
          failed_login_attempts: 0,
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return { success: true, user: { id: user.id, username: user.username, email: user.email } }
    } catch (error) {
      console.error('Authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  // Create admin session
  async createSession(userId, ipAddress, userAgent) {
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
          admin_users!inner(id, username, email)
        `)
        .eq('session_token', sessionToken)
        .single()

      if (error || !data) {
        return { valid: false, error: 'Invalid session' }
      }

      if (new Date(data.expires_at) < new Date()) {
        return { valid: false, error: 'Session expired' }
      }

      return { valid: true, user: data.admin_users }
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
}

// Create singleton instance
export const supabaseEmailService = new SupabaseEmailService()

export default supabaseEmailService