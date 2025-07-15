// Email Service for handling password reset and notifications
export class EmailService {
  constructor() {
    this.smtpSettings = this.loadSMTPSettings()
  }

  // Load SMTP settings from storage
  loadSMTPSettings() {
    const settings = JSON.parse(localStorage.getItem('smtp-settings') || '{}')
    return {
      host: settings.host || '',
      port: settings.port || 587,
      secure: settings.secure || false,
      username: settings.username || '',
      password: settings.password || '',
      fromName: settings.fromName || 'Dan Pearson Portfolio',
      fromEmail: settings.fromEmail || 'noreply@danpearson.com',
      requireAuth: settings.requireAuth !== false,
      resetSubject: settings.resetSubject || 'Password Reset Request',
      resetTemplate: settings.resetTemplate || this.getDefaultResetTemplate()
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
  generateResetToken() {
    const token = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    // Store token in localStorage for demo purposes
    const resetTokens = JSON.parse(localStorage.getItem('reset-tokens') || '{}')
    resetTokens[token] = {
      email: 'pearsonperformance@gmail.com', // Default admin email
      expiresAt: expiresAt.toISOString(),
      used: false
    }
    localStorage.setItem('reset-tokens', JSON.stringify(resetTokens))
    
    return { token, expiresAt }
  }

  // Validate reset token
  validateResetToken(token) {
    const resetTokens = JSON.parse(localStorage.getItem('reset-tokens') || '{}')
    const tokenData = resetTokens[token]
    
    if (!tokenData) {
      return { valid: false, error: 'Invalid reset token' }
    }
    
    if (tokenData.used) {
      return { valid: false, error: 'Reset token has already been used' }
    }
    
    if (new Date(tokenData.expiresAt) < new Date()) {
      return { valid: false, error: 'Reset token has expired' }
    }
    
    return { valid: true, email: tokenData.email }
  }

  // Mark reset token as used
  markTokenAsUsed(token) {
    const resetTokens = JSON.parse(localStorage.getItem('reset-tokens') || '{}')
    if (resetTokens[token]) {
      resetTokens[token].used = true
      localStorage.setItem('reset-tokens', JSON.stringify(resetTokens))
    }
  }

  // Send password reset email (simulated)
  async sendPasswordResetEmail(email) {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Invalid email format' }
      }

      // Check if email exists (in a real app, check against user database)
      const validEmails = ['pearsonperformance@gmail.com', 'admin@danpearson.com']
      if (!validEmails.includes(email.toLowerCase())) {
        return { success: false, error: 'Email address not found' }
      }

      // Generate reset token
      const { token, expiresAt } = this.generateResetToken()
      
      // Create reset link
      const resetLink = `${window.location.origin}/admin/reset-password?token=${token}`
      
      // Prepare email content
      const emailContent = this.smtpSettings.resetTemplate.replace('{{resetLink}}', resetLink)
      
      // Simulate email sending (in production, use actual SMTP service)
      console.log('Sending password reset email:', {
        to: email,
        from: `${this.smtpSettings.fromName} <${this.smtpSettings.fromEmail}>`,
        subject: this.smtpSettings.resetSubject,
        content: emailContent,
        resetLink
      })
      
      // Log the email attempt
      this.logEmailAttempt({
        type: 'password_reset',
        to: email,
        status: 'sent',
        timestamp: new Date().toISOString(),
        token
      })
      
      return { 
        success: true, 
        message: 'Password reset email sent successfully',
        resetLink // For demo purposes only
      }
      
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      
      this.logEmailAttempt({
        type: 'password_reset',
        to: email,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
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

      // Simulate email sending
      console.log('Sending notification email:', {
        to,
        from: `${this.smtpSettings.fromName} <${this.smtpSettings.fromEmail}>`,
        subject,
        message,
        type
      })
      
      this.logEmailAttempt({
        type,
        to,
        subject,
        status: 'sent',
        timestamp: new Date().toISOString()
      })
      
      return { success: true, message: 'Notification email sent successfully' }
      
    } catch (error) {
      console.error('Failed to send notification email:', error)
      
      this.logEmailAttempt({
        type,
        to,
        subject,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      return { success: false, error: 'Failed to send notification email' }
    }
  }

  // Test SMTP connection
  async testSMTPConnection() {
    try {
      // Simulate SMTP connection test
      if (!this.smtpSettings.host || !this.smtpSettings.username) {
        return { success: false, error: 'SMTP settings incomplete' }
      }
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Testing SMTP connection:', {
        host: this.smtpSettings.host,
        port: this.smtpSettings.port,
        secure: this.smtpSettings.secure,
        username: this.smtpSettings.username
      })
      
      return { success: true, message: 'SMTP connection successful' }
      
    } catch (error) {
      console.error('SMTP connection test failed:', error)
      return { success: false, error: 'SMTP connection failed' }
    }
  }

  // Update SMTP settings
  updateSMTPSettings(newSettings) {
    this.smtpSettings = { ...this.smtpSettings, ...newSettings }
    localStorage.setItem('smtp-settings', JSON.stringify(this.smtpSettings))
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Log email attempts
  logEmailAttempt(logData) {
    const emailLogs = JSON.parse(localStorage.getItem('email-logs') || '[]')
    emailLogs.push({
      id: Date.now(),
      ...logData
    })
    
    // Keep only last 100 logs
    if (emailLogs.length > 100) {
      emailLogs.splice(0, emailLogs.length - 100)
    }
    
    localStorage.setItem('email-logs', JSON.stringify(emailLogs))
  }

  // Get email logs
  getEmailLogs() {
    return JSON.parse(localStorage.getItem('email-logs') || '[]')
  }

  // Get email statistics
  getEmailStats() {
    const logs = this.getEmailLogs()
    const now = new Date()
    const last24Hours = logs.filter(log => 
      new Date(log.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
    )
    const last7Days = logs.filter(log => 
      new Date(log.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    )
    
    return {
      total: logs.length,
      sent: logs.filter(log => log.status === 'sent').length,
      failed: logs.filter(log => log.status === 'failed').length,
      last24Hours: last24Hours.length,
      last7Days: last7Days.length,
      passwordResets: logs.filter(log => log.type === 'password_reset').length,
      notifications: logs.filter(log => log.type === 'notification').length
    }
  }

  // Clear old logs
  clearOldLogs(daysToKeep = 30) {
    const logs = this.getEmailLogs()
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    const filteredLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate)
    localStorage.setItem('email-logs', JSON.stringify(filteredLogs))
    return logs.length - filteredLogs.length // Return number of deleted logs
  }

  // Export email logs
  exportEmailLogs() {
    const logs = this.getEmailLogs()
    const stats = this.getEmailStats()
    
    const exportData = {
      logs,
      stats,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }
}

// Create singleton instance
export const emailService = new EmailService()

export default emailService