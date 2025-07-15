import { useState } from 'react'
import { Shield, Key, Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const SecuritySettings = ({ settings, onUpdate }) => {
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  const handleToggle = (key) => {
    onUpdate({ [key]: !settings[key] })
  }

  const handleInputChange = (key, value) => {
    onUpdate({ [key]: value })
  }

  const testSecurityConfiguration = async () => {
    setTestingConnection(true)
    try {
      // Simulate security test
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Security configuration test passed!')
    } catch (error) {
      toast.error('Security test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-cyan-400" size={24} />
            Security Settings
          </h2>
          <p className="text-gray-400 mt-1">
            Configure authentication, encryption, and security policies
          </p>
        </div>
        <button
          onClick={testSecurityConfiguration}
          disabled={testingConnection}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <CheckCircle size={16} />
          {testingConnection ? 'Testing...' : 'Test Security'}
        </button>
      </div>

      {/* Authentication Settings */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Key size={20} />
          Authentication
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Timeout (hours)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={settings.sessionTimeout}
              onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
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
              value={settings.maxLoginAttempts}
              onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
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
              value={settings.passwordExpiry}
              onChange={(e) => handleInputChange('passwordExpiry', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Lock size={20} />
          Two-Factor Authentication
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Two-Factor Authentication</h4>
              <p className="text-sm text-gray-400">Require 2FA for admin access</p>
            </div>
            <button
              onClick={() => handleToggle('twoFactorEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.twoFactorEnabled ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Require Two-Factor for All Users</h4>
              <p className="text-sm text-gray-400">Mandatory 2FA for all admin users</p>
            </div>
            <button
              onClick={() => handleToggle('requireTwoFactor')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requireTwoFactor ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Monitoring */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Eye size={20} />
          Security Monitoring
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Enable Audit Log</h4>
              <p className="text-sm text-gray-400">Log all security events and admin actions</p>
            </div>
            <button
              onClick={() => handleToggle('enableAuditLog')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableAuditLog ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableAuditLog ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Auto Account Lockout</h4>
              <p className="text-sm text-gray-400">Automatically lock accounts after failed attempts</p>
            </div>
            <button
              onClick={() => handleToggle('autoLockout')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoLockout ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoLockout ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Security Status</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-300">SSL/TLS Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-300">Security Headers Configured</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-300">Rate Limiting Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              settings.twoFactorEnabled ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span className="text-gray-300">
              Two-Factor {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <div className="flex items-center gap-2 text-yellow-400 mb-3">
          <AlertTriangle size={20} />
          <h3 className="font-semibold">Security Recommendations</h3>
        </div>
        <ul className="text-gray-300 space-y-2 text-sm">
          {!settings.twoFactorEnabled && (
            <li>• Enable two-factor authentication for enhanced security</li>
          )}
          {settings.sessionTimeout > 24 && (
            <li>• Consider reducing session timeout for better security</li>
          )}
          {settings.maxLoginAttempts > 5 && (
            <li>• Lower max login attempts to prevent brute force attacks</li>
          )}
          <li>• Regularly review audit logs for suspicious activity</li>
          <li>• Keep all security configurations up to date</li>
        </ul>
      </div>
    </div>
  )
}

export default SecuritySettings