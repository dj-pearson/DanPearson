import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Settings,
  Shield,
  Search,
  Zap,
  BarChart3,
  Cloud,
  HardDrive,
  Globe,
  Lock,
  Eye,
  RefreshCw,
  Save,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Mail
} from 'lucide-react'
import SMTPSettings from '../../components/settings/SMTPSettings'
import { settingsStorage } from '../../utils/SettingsStorage'

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('security')
  const [settings, setSettings] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [systemStatus, setSystemStatus] = useState({
    security: { status: 'good', score: 0 },
    seo: { status: 'good', score: 0 },
    performance: { status: 'good', score: 0 },
    smtp: { status: 'good', score: 0 },
    overall: 0
  })

  const tabs = [
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Authentication, encryption, and security policies'
    },
    {
      id: 'seo',
      name: 'SEO',
      icon: Search,
      description: 'Search engine optimization and meta tags'
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: Zap,
      description: 'Caching, optimization, and Core Web Vitals'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'Privacy-first analytics and tracking'
    },
    {
      id: 'monitoring',
      name: 'Monitoring',
      icon: Eye,
      description: 'Uptime, performance, and error monitoring'
    },
    {
      id: 'backup',
      name: 'Backup',
      icon: HardDrive,
      description: 'Automated backups and disaster recovery'
    },
    {
      id: 'smtp',
      name: 'Email/SMTP',
      icon: Mail,
      description: 'Email server configuration and templates'
    },
  ]

  useEffect(() => {
    initializeSettings()
  }, [])

  useEffect(() => {
    calculateSystemStatus()
  }, [settings])

  const initializeSettings = async () => {
    try {
      await settingsStorage.initialize()
      const allSettings = settingsStorage.getAll()
      setSettings(allSettings)

      const savedTime = localStorage.getItem('admin-settings-saved')
      if (savedTime) {
        setLastSaved(new Date(savedTime))
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await settingsStorage.saveAll()
      const now = new Date()
      localStorage.setItem('admin-settings-saved', now.toISOString())
      setLastSaved(now)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const calculateSystemStatus = () => {
    let securityScore = 0
    let seoScore = 0
    let performanceScore = 0
    let smtpScore = 0

    // Security scoring
    if (settings.security.twoFactorEnabled) securityScore += 25
    if (settings.security.enableAuditLog) securityScore += 20
    if (settings.security.autoLockout) securityScore += 15
    if (settings.security.sessionTimeout <= 24) securityScore += 20
    if (settings.security.maxLoginAttempts <= 5) securityScore += 20

    // SEO scoring
    if (settings.seo.siteName && settings.seo.siteDescription) seoScore += 30
    if (settings.seo.enableSitemap) seoScore += 25
    if (settings.seo.enableRobots) seoScore += 20
    if (settings.seo.googleAnalyticsId) seoScore += 15
    if (settings.seo.blockAICrawlers) seoScore += 10

    // Performance scoring
    if (settings.performance.enableCaching) performanceScore += 25
    if (settings.performance.imageOptimization) performanceScore += 20
    if (settings.performance.enableCompression) performanceScore += 20
    if (settings.performance.lazyLoading) performanceScore += 15
    if (settings.performance.preloadCritical) performanceScore += 20

    // SMTP scoring
    if (settings.smtp.host && settings.smtp.username && settings.smtp.password) smtpScore += 40
    if (settings.smtp.secure) smtpScore += 30
    if (settings.smtp.fromName && settings.smtp.fromEmail) smtpScore += 30

    const overall = Math.round((securityScore + seoScore + performanceScore + smtpScore) / 4)

    setSystemStatus({
      security: {
        status: securityScore >= 80 ? 'good' : securityScore >= 60 ? 'warning' : 'poor',
        score: securityScore
      },
      seo: {
        status: seoScore >= 80 ? 'good' : seoScore >= 60 ? 'warning' : 'poor',
        score: seoScore
      },
      performance: {
        status: performanceScore >= 80 ? 'good' : performanceScore >= 60 ? 'warning' : 'poor',
        score: performanceScore
      },
      smtp: {
        status: smtpScore >= 80 ? 'good' : smtpScore >= 60 ? 'warning' : 'poor',
        score: smtpScore
      },
      overall
    })
  }

  const updateSettings = async (category, newSettings) => {
    try {
      await settingsStorage.setCategory(category, newSettings)
      const updatedSettings = settingsStorage.getAll()
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast.error('Failed to update settings')
    }
  }

  const exportSettings = async () => {
    try {
      const exportData = await settingsStorage.exportSettings()
      const dataBlob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-settings-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Settings exported successfully!')
    } catch (error) {
      console.error('Failed to export settings:', error)
      toast.error('Failed to export settings')
    }
  }

  const importSettings = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const success = await settingsStorage.importSettings(e.target.result)
        if (success) {
          const updatedSettings = settingsStorage.getAll()
          setSettings(updatedSettings)
          toast.success('Settings imported successfully!')
        } else {
          toast.error('Invalid settings file')
        }
      } catch (error) {
        console.error('Failed to import settings:', error)
        toast.error('Failed to import settings')
      }
    }
    reader.readAsText(file)
  }

  const runSystemCheck = async () => {
    toast.loading('Running system check...', { id: 'system-check' })

    // Simulate system check with real calculations
    await new Promise(resolve => setTimeout(resolve, 2000))

    calculateSystemStatus()
    toast.success(`System check completed! Overall score: ${systemStatus.overall}%`, { id: 'system-check' })
  }

  const renderTabContent = () => {
    const currentSettings = settings[activeTab]
    if (!currentSettings) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Settings, {
                className: "text-cyan-400",
                size: 24
              })}
              {tabs.find(t => t.id === activeTab)?.name} Settings
            </h2>
            <p className="text-gray-400 mt-1">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm ${
              systemStatus[activeTab]?.status === 'good' ? 'bg-green-500/20 text-green-400' :
              systemStatus[activeTab]?.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              Score: {systemStatus[activeTab]?.score || 0}%
            </div>
          </div>
        </div>

        {/* Dynamic settings form based on active tab */}
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="space-y-4">
            {Object.entries(currentSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-400">
                    Configure {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                {typeof value === 'boolean' ? (
                  <button
                    onClick={() => updateSettings(activeTab, { [key]: !value })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : typeof value === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateSettings(activeTab, { [key]: parseInt(e.target.value) || 0 })}
                    className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateSettings(activeTab, { [key]: e.target.value })}
                    className="w-48 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none text-white text-sm"
                    placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        {activeTab === 'smtp' && (
          <SMTPSettings
            settings={settings.smtp}
            onUpdate={(newSettings) => updateSettings('smtp', newSettings)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="text-cyan-400" size={32} />
            System Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Configure security, performance, SEO, and monitoring settings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runSystemCheck}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            System Check
          </button>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
              id="import-settings"
            />
            <label
              htmlFor="import-settings"
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Upload size={16} />
              Import
            </label>

            <button
              onClick={exportSettings}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {lastSaved && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle size={16} />
          <span>Last saved: {lastSaved.toLocaleString()}</span>
        </div>
      )}

      {/* System Status Overview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">System Status Overview</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400 mb-1">{systemStatus.overall}%</div>
            <div className="text-sm text-gray-400">Overall Score</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${
              systemStatus.security.status === 'good' ? 'text-green-400' :
              systemStatus.security.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`}>{systemStatus.security.score}%</div>
            <div className="text-sm text-gray-400">Security</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${
              systemStatus.seo.status === 'good' ? 'text-green-400' :
              systemStatus.seo.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`}>{systemStatus.seo.score}%</div>
            <div className="text-sm text-gray-400">SEO</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${
              systemStatus.performance.status === 'good' ? 'text-green-400' :
              systemStatus.performance.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`}>{systemStatus.performance.score}%</div>
            <div className="text-sm text-gray-400">Performance</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${
              systemStatus.smtp?.status === 'good' ? 'text-green-400' :
              systemStatus.smtp?.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`}>{systemStatus.smtp?.score || 0}%</div>
            <div className="text-sm text-gray-400">SMTP/Email</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-4 border border-cyan-500/20 sticky top-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Categories</h3>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-cyan-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs opacity-75 mt-1">{tab.description}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-cyan-500/20"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings