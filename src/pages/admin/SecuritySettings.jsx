import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { SecurityUtils } from '../../utils/SecurityUtils'
import {
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Smartphone,
  Server,
  FileText,
  Zap,
  Settings,
  RefreshCw
} from 'lucide-react'

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(null)
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    requireTwoFactor: false,
    allowedIPs: '',
    enableAuditLog: true,
    autoLockout: true,
    twoFactorEnabled: false
  })
  const [securityLogs, setSecurityLogs] = useState([])
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 0,
    failedAttempts: 0,
    blockedIPs: 0,
    lastActivity: null
  })

  useEffect(() => {
    loadSecurityData()
    startRealTimeMonitoring()
    if (newPassword) {
      const strength = SecurityUtils.calculatePasswordStrength(newPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [newPassword])

  const loadSecurityData = () => {
    // Load real security logs from localStorage
    const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
    setSecurityLogs(logs)

    // Load security settings
    const settings = JSON.parse(localStorage.getItem('security-settings') || '{}')
    setSecuritySettings(prev => ({ ...prev, ...settings }))

    // Load 2FA status
    const twoFA = localStorage.getItem('two-factor-enabled') === 'true'
    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: twoFA }))
  }

  const startRealTimeMonitoring = () => {
    const updateStats = () => {
      const now = new Date()
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      const recentLogs = logs.filter(log =>
        new Date(log.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
      )

      setRealTimeStats({
        activeUsers: 1, // Current user
        failedAttempts: recentLogs.filter(log => log.action.includes('Failed')).length,
        blockedIPs: new Set(recentLogs.filter(log => log.status === 'blocked').map(log => log.ip)).size,
        lastActivity: logs.length > 0 ? logs[logs.length - 1].timestamp : now.toISOString()
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }

  const logSecurityEvent = (action, details = {}) => {
    const logEntry = {
      id: Date.now(),
      action,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1', // Local IP for demo
      userAgent: navigator.userAgent,
      status: 'success',
      ...details
    }

    const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
    logs.push(logEntry)

    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }

    localStorage.setItem('security-logs', JSON.stringify(logs))
    setSecurityLogs(logs)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    const validation = SecurityUtils.validatePassword(newPassword)
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      // Hash password for additional security
      const hashedPassword = await SecurityUtils.hashPassword(newPassword)

      // Store hashed password
      localStorage.setItem('admin-password-hash', hashedPassword)

      // Log security event
      logSecurityEvent('Password Changed', {
        strength: passwordStrength.level,
        timestamp: new Date().toISOString()
      })

      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordStrength(null)
    } catch (error) {
      toast.error('Failed to update password')
      logSecurityEvent('Password Change Failed', {
        error: error.message,
        status: 'failed'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleTwoFactorToggle = async () => {
    try {
      const newStatus = !securitySettings.twoFactorEnabled
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: newStatus }))
      localStorage.setItem('two-factor-enabled', newStatus.toString())

      logSecurityEvent(`Two-Factor Authentication ${newStatus ? 'Enabled' : 'Disabled'}`, {
        previousState: securitySettings.twoFactorEnabled,
        newState: newStatus
      })

      toast.success(`Two-factor authentication ${newStatus ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update two-factor authentication')
    }
  }

  const handleSecuritySettingChange = (setting, value) => {
    const newSettings = { ...securitySettings, [setting]: value }
    setSecuritySettings(newSettings)
    localStorage.setItem('security-settings', JSON.stringify(newSettings))

    logSecurityEvent('Security Setting Changed', {
      setting,
      oldValue: securitySettings[setting],
      newValue: value
    })
  }

  const runSecurityScan = async () => {
    toast.loading('Running security scan...', { id: 'security-scan' })

    try {
      // Simulate comprehensive security scan
      await new Promise(resolve => setTimeout(resolve, 3000))

      const scanResults = {
        vulnerabilities: 0,
        warnings: securitySettings.twoFactorEnabled ? 0 : 1,
        recommendations: [],
        score: 0
      }

      // Calculate security score based on actual settings
      let score = 0
      if (securitySettings.twoFactorEnabled) score += 25
      if (securitySettings.enableAuditLog) score += 20
      if (securitySettings.autoLockout) score += 15
      if (securitySettings.sessionTimeout <= 24) score += 20
      if (securitySettings.maxLoginAttempts <= 5) score += 20

      scanResults.score = score

      if (!securitySettings.twoFactorEnabled) {
        scanResults.recommendations.push('Enable two-factor authentication')
      }
      if (securitySettings.sessionTimeout > 24) {
        scanResults.recommendations.push('Reduce session timeout for better security')
      }

      logSecurityEvent('Security Scan Completed', scanResults)

      toast.success(`Security scan completed - Score: ${score}%`, { id: 'security-scan' })
    } catch (error) {
      toast.error('Security scan failed', { id: 'security-scan' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="text-cyan-400" size={32} />
          Security Center
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={runSecurityScan}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <RefreshCw size={16} />
            Security Scan
          </button>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle size={16} />
            <span>Status: Active</span>
          </div>
        </div>
      </div>

      {/* Real-time Security Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
          <Settings size={20} />
          Real-time Security Status
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-1">{realTimeStats.activeUsers}</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${
              realTimeStats.failedAttempts > 5 ? 'text-red-400' :
              realTimeStats.failedAttempts > 0 ? 'text-yellow-400' : 'text-green-400'
            }`}>{realTimeStats.failedAttempts}</div>
            <div className="text-sm text-gray-400">Failed Attempts (24h)</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${
              realTimeStats.blockedIPs > 0 ? 'text-red-400' : 'text-green-400'
            }`}>{realTimeStats.blockedIPs}</div>
            <div className="text-sm text-gray-400">Blocked IPs</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-sm font-bold text-cyan-400 mb-1">
              {realTimeStats.lastActivity ? new Date(realTimeStats.lastActivity).toLocaleTimeString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Last Activity</div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Password Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            <Key size={20} />
            Password Management
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={12}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.score >= 4 ? 'text-green-400' :
                      passwordStrength.score >= 2 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {passwordStrength.level}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 4 ? 'bg-green-500' :
                        passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
        >
          <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            <Smartphone size={20} />
            Two-Factor Authentication
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">Authenticator App</h3>
                <p className="text-sm text-gray-400">
                  Use an authenticator app for additional security
                </p>
              </div>
              <button
                onClick={handleTwoFactorToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.twoFactorEnabled ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {securitySettings.twoFactorEnabled ? (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle size={16} />
                  <span className="font-medium">Two-Factor Authentication Enabled</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Your account is protected with two-factor authentication.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <AlertTriangle size={16} />
                  <span className="font-medium">Security Recommendation</span>
                </div>
                <p className="text-sm text-gray-300">
                  Enable two-factor authentication to significantly improve your account security.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
          <Settings size={20} />
          Security Settings
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => handleSecuritySettingChange('maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={securitySettings.passwordExpiry}
                onChange={(e) => handleSecuritySettingChange('passwordExpiry', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Enable Audit Log</h4>
                <p className="text-sm text-gray-400">Log all security events</p>
              </div>
              <button
                onClick={() => handleSecuritySettingChange('enableAuditLog', !securitySettings.enableAuditLog)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.enableAuditLog ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.enableAuditLog ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Auto Account Lockout</h4>
                <p className="text-sm text-gray-400">Lock after failed attempts</p>
              </div>
              <button
                onClick={() => handleSecuritySettingChange('autoLockout', !securitySettings.autoLockout)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.autoLockout ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.autoLockout ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
      >
        <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
          <Clock size={20} />
          Recent Security Activity
        </h2>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {securityLogs.slice(-10).reverse().map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <div className="font-medium text-white">{log.action}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {log.ip}
              </div>
            </div>
          ))}
          {securityLogs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No security events logged yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default SecuritySettings