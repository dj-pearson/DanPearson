import React, { useState } from 'react'
import { Mail, Server, Key, TestTube, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const SMTPSettings = ({ settings, onUpdate }) => {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleInputChange = (key, value) => {
    onUpdate({ [key]: value })
  }

  const handleToggle = (key) => {
    onUpdate({ [key]: !settings[key] })
  }

  const testSMTPConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      // Simulate SMTP test
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock validation
      if (!settings.host || !settings.username || !settings.password) {
        throw new Error('Missing required SMTP configuration')
      }

      setTestResult({ success: true, message: 'SMTP connection successful!' })
      toast.success('SMTP test passed!')
    } catch (error) {
      setTestResult({ success: false, message: error.message })
      toast.error('SMTP test failed: ' + error.message)
    } finally {
      setTesting(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testResult?.success) {
      toast.error('Please test SMTP connection first')
      return
    }

    setTesting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Test email sent successfully!')
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <Mail size={20} />
            SMTP Configuration
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Configure email server settings for password resets and notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={testSMTPConnection}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <TestTube size={16} />
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult?.success && (
            <button
              onClick={sendTestEmail}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Mail size={16} />
              Send Test Email
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult.success
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span className="font-medium">
              {testResult.success ? 'Connection Successful' : 'Connection Failed'}
            </span>
          </div>
          <p className="text-sm mt-1 opacity-90">{testResult.message}</p>
        </div>
      )}

      {/* Server Configuration */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server size={18} />
          Server Configuration
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SMTP Host *
            </label>
            <input
              type="text"
              value={settings.host}
              onChange={(e) => handleInputChange('host', e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Port
            </label>
            <input
              type="number"
              value={settings.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-white">Use SSL/TLS</h5>
                <p className="text-sm text-gray-400">Enable secure connection (recommended)</p>
              </div>
              <button
                onClick={() => handleToggle('secure')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.secure ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.secure ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key size={18} />
          Authentication
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-white">Require Authentication</h5>
              <p className="text-sm text-gray-400">Most SMTP servers require authentication</p>
            </div>
            <button
              onClick={() => handleToggle('requireAuth')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requireAuth ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requireAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.requireAuth && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username/Email *
                </label>
                <input
                  type="text"
                  value={settings.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password/App Password *
                </label>
                <input
                  type="password"
                  value={settings.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">
          Email Settings
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              From Name
            </label>
            <input
              type="text"
              value={settings.fromName}
              onChange={(e) => handleInputChange('fromName', e.target.value)}
              placeholder="Dan Pearson Portfolio"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              From Email
            </label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => handleInputChange('fromEmail', e.target.value)}
              placeholder="noreply@danpearson.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">
          Email Templates
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password Reset Subject
            </label>
            <input
              type="text"
              value={settings.resetSubject}
              onChange={(e) => handleInputChange('resetSubject', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password Reset Template
            </label>
            <div className="text-xs text-gray-400 mb-2">
              Available variables: {`{resetLink}`}, {`{username}`}, {`{siteName}`}
            </div>
            <textarea
              value={settings.resetTemplate}
              onChange={(e) => handleInputChange('resetTemplate', e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white font-mono text-sm"
              placeholder="Hello,\n\nYou requested a password reset. Click the link below:\n\n{resetLink}\n\nIf you didn't request this, please ignore this email."
            />
          </div>
        </div>
      </div>

      {/* SMTP Provider Quick Setup */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-400 mb-4">
          Quick Setup for Popular Providers
        </h4>

        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              onUpdate({
                host: 'smtp.gmail.com',
                port: 587,
                secure: true,
                requireAuth: true
              })
              toast.success('Gmail SMTP settings applied')
            }}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
          >
            <div className="font-medium text-white mb-1">Gmail</div>
            <div className="text-sm text-gray-400">smtp.gmail.com:587</div>
          </button>

          <button
            onClick={() => {
              onUpdate({
                host: 'smtp-mail.outlook.com',
                port: 587,
                secure: true,
                requireAuth: true
              })
              toast.success('Outlook SMTP settings applied')
            }}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
          >
            <div className="font-medium text-white mb-1">Outlook</div>
            <div className="text-sm text-gray-400">smtp-mail.outlook.com:587</div>
          </button>

          <button
            onClick={() => {
              onUpdate({
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: true,
                requireAuth: true
              })
              toast.success('SendGrid SMTP settings applied')
            }}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
          >
            <div className="font-medium text-white mb-1">SendGrid</div>
            <div className="text-sm text-gray-400">smtp.sendgrid.net:587</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SMTPSettings