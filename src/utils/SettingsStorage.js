import { storageManager } from './StorageManager'

// Settings Storage Utility with automatic persistence
export class SettingsStorage {
  constructor() {
    this.cache = new Map()
    this.listeners = new Map()
    this.autoSaveDelay = 1000 // 1 second
    this.saveTimeouts = new Map()
  }

  // Initialize settings storage
  async initialize() {
    await storageManager.initialize()
    await this.loadAllSettings()
    console.log('Settings Storage initialized')
  }

  // Load all settings into cache
  async loadAllSettings() {
    try {
      const allSettings = await storageManager.getAll('settings')
      
      // Group settings by category
      const categorizedSettings = {}
      
      allSettings.forEach(setting => {
        const category = setting.category || 'general'
        if (!categorizedSettings[category]) {
          categorizedSettings[category] = {}
        }
        categorizedSettings[category][setting.key.replace(`${category}.`, '')] = setting.value
      })
      
      // Store in cache
      for (const [category, settings] of Object.entries(categorizedSettings)) {
        this.cache.set(category, settings)
      }
      
      // Load default settings if none exist
      if (allSettings.length === 0) {
        await this.loadDefaultSettings()
      }
      
      console.log('Settings loaded:', categorizedSettings)
    } catch (error) {
      console.error('Failed to load settings:', error)
      await this.loadDefaultSettings()
    }
  }

  // Load default settings
  async loadDefaultSettings() {
    const defaultSettings = {
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordExpiry: 90,
        requireTwoFactor: false,
        enableAuditLog: true,
        autoLockout: true
      },
      seo: {
        siteName: 'Dan Pearson Portfolio',
        siteDescription: 'Sales Leader, NFT Developer & AI Enthusiast',
        defaultImage: '/images/og-default.jpg',
        googleAnalyticsId: '',
        googleSearchConsole: '',
        bingWebmaster: '',
        enableSitemap: true,
        enableRobots: true,
        blockAICrawlers: true
      },
      performance: {
        enableCaching: true,
        cacheStrategy: 'stale-while-revalidate',
        imageOptimization: true,
        enableCompression: true,
        enableMinification: true,
        lazyLoading: true,
        preloadCritical: true
      },
      cdn: {
        provider: 'cloudflare',
        enabled: false,
        zoneId: '',
        apiToken: '',
        enableImageOptimization: true,
        enableCompression: true,
        cacheLevel: 'standard'
      },
      analytics: {
        provider: 'plausible',
        domain: 'danpearson.com',
        respectDNT: true,
        anonymizeIP: true,
        cookieless: true,
        trackingId: ''
      },
      monitoring: {
        enabled: true,
        uptimeChecks: true,
        performanceMonitoring: true,
        errorTracking: true,
        securityMonitoring: true,
        alertEmail: 'pearsonperformance@gmail.com'
      },
      backup: {
        enabled: true,
        schedule: 'daily',
        retention: 30,
        storage: 'local',
        s3Bucket: '',
        encryptBackups: true,
        autoCleanup: true
      },
      smtp: {
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromName: 'Dan Pearson Portfolio',
        fromEmail: 'noreply@danpearson.com',
        requireAuth: true,
        resetSubject: 'Password Reset Request',
        resetTemplate: 'Hello,\n\nYou requested a password reset. Click the link below to reset your password:\n\n{{resetLink}}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nDan Pearson Portfolio Team'
      },
      ai: {
        defaultModel: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        autoSEO: true,
        apiKeys: {
          openai: '',
          claude: '',
          gemini: ''
        }
      },
      general: {
        siteMaintenance: false,
        debugMode: false,
        logLevel: 'info',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      }
    }

    // Save default settings
    for (const [category, settings] of Object.entries(defaultSettings)) {
      await this.setCategory(category, settings)
    }

    console.log('Default settings loaded')
  }

  // Get setting by category and key
  get(category, key, defaultValue = null) {
    const categorySettings = this.cache.get(category)
    if (!categorySettings) {
      return defaultValue
    }
    return categorySettings[key] !== undefined ? categorySettings[key] : defaultValue
  }

  // Get all settings for a category
  getCategory(category) {
    return this.cache.get(category) || {}
  }

  // Get all settings
  getAll() {
    const allSettings = {}
    for (const [category, settings] of this.cache.entries()) {
      allSettings[category] = { ...settings }
    }
    return allSettings
  }

  // Set a single setting
  async set(category, key, value, immediate = false) {
    // Update cache
    if (!this.cache.has(category)) {
      this.cache.set(category, {})
    }
    
    const categorySettings = this.cache.get(category)
    const oldValue = categorySettings[key]
    categorySettings[key] = value
    
    // Trigger change listeners
    this.notifyListeners(category, key, value, oldValue)
    
    // Save to storage (with debouncing unless immediate)
    if (immediate) {
      await this.saveToStorage(category, key, value)
    } else {
      this.debouncedSave(category, key, value)
    }
    
    return value
  }

  // Set multiple settings for a category
  async setCategory(category, settings, immediate = false) {
    const oldSettings = this.cache.get(category) || {}
    
    // Update cache
    this.cache.set(category, { ...oldSettings, ...settings })
    
    // Trigger change listeners for each changed setting
    for (const [key, value] of Object.entries(settings)) {
      if (oldSettings[key] !== value) {
        this.notifyListeners(category, key, value, oldSettings[key])
      }
    }
    
    // Save to storage
    if (immediate) {
      await this.saveCategoryToStorage(category, settings)
    } else {
      this.debouncedSaveCategory(category, settings)
    }
    
    return this.cache.get(category)
  }

  // Debounced save for single setting
  debouncedSave(category, key, value) {
    const settingKey = `${category}.${key}`
    
    // Clear existing timeout
    if (this.saveTimeouts.has(settingKey)) {
      clearTimeout(this.saveTimeouts.get(settingKey))
    }
    
    // Set new timeout
    const timeout = setTimeout(async () => {
      await this.saveToStorage(category, key, value)
      this.saveTimeouts.delete(settingKey)
    }, this.autoSaveDelay)
    
    this.saveTimeouts.set(settingKey, timeout)
  }

  // Debounced save for category
  debouncedSaveCategory(category, settings) {
    const categoryKey = `category.${category}`
    
    // Clear existing timeout
    if (this.saveTimeouts.has(categoryKey)) {
      clearTimeout(this.saveTimeouts.get(categoryKey))
    }
    
    // Set new timeout
    const timeout = setTimeout(async () => {
      await this.saveCategoryToStorage(category, settings)
      this.saveTimeouts.delete(categoryKey)
    }, this.autoSaveDelay)
    
    this.saveTimeouts.set(categoryKey, timeout)
  }

  // Save single setting to storage
  async saveToStorage(category, key, value) {
    try {
      const settingKey = `${category}.${key}`
      await storageManager.setSetting(settingKey, value, category)
      console.log(`Setting saved: ${settingKey} = ${value}`)
    } catch (error) {
      console.error(`Failed to save setting ${category}.${key}:`, error)
    }
  }

  // Save category settings to storage
  async saveCategoryToStorage(category, settings) {
    try {
      const promises = Object.entries(settings).map(([key, value]) => {
        const settingKey = `${category}.${key}`
        return storageManager.setSetting(settingKey, value, category)
      })
      
      await Promise.all(promises)
      console.log(`Category settings saved: ${category}`, settings)
    } catch (error) {
      console.error(`Failed to save category settings ${category}:`, error)
    }
  }

  // Force save all pending changes
  async saveAll() {
    // Clear all timeouts and save immediately
    const promises = []
    
    for (const [key, timeout] of this.saveTimeouts.entries()) {
      clearTimeout(timeout)
      
      if (key.startsWith('category.')) {
        const category = key.replace('category.', '')
        const settings = this.cache.get(category)
        if (settings) {
          promises.push(this.saveCategoryToStorage(category, settings))
        }
      } else {
        const [category, settingKey] = key.split('.')
        const value = this.get(category, settingKey)
        if (value !== null) {
          promises.push(this.saveToStorage(category, settingKey, value))
        }
      }
    }
    
    this.saveTimeouts.clear()
    await Promise.all(promises)
    console.log('All settings saved')
  }

  // Add change listener
  addListener(category, key, callback) {
    const listenerKey = `${category}.${key}`
    
    if (!this.listeners.has(listenerKey)) {
      this.listeners.set(listenerKey, new Set())
    }
    
    this.listeners.get(listenerKey).add(callback)
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(listenerKey)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(listenerKey)
        }
      }
    }
  }

  // Add category listener
  addCategoryListener(category, callback) {
    const listenerKey = `category.${category}`
    
    if (!this.listeners.has(listenerKey)) {
      this.listeners.set(listenerKey, new Set())
    }
    
    this.listeners.get(listenerKey).add(callback)
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(listenerKey)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(listenerKey)
        }
      }
    }
  }

  // Notify listeners of changes
  notifyListeners(category, key, newValue, oldValue) {
    // Notify specific setting listeners
    const settingListeners = this.listeners.get(`${category}.${key}`)
    if (settingListeners) {
      settingListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, key)
        } catch (error) {
          console.error('Settings listener error:', error)
        }
      })
    }
    
    // Notify category listeners
    const categoryListeners = this.listeners.get(`category.${category}`)
    if (categoryListeners) {
      const categorySettings = this.getCategory(category)
      categoryListeners.forEach(callback => {
        try {
          callback(categorySettings, key, newValue, oldValue)
        } catch (error) {
          console.error('Settings category listener error:', error)
        }
      })
    }
  }

  // Reset category to defaults
  async resetCategory(category) {
    // Remove from cache
    this.cache.delete(category)
    
    // Remove from storage
    const allSettings = await storageManager.getAll('settings')
    const categorySettings = allSettings.filter(s => s.category === category)
    
    for (const setting of categorySettings) {
      await storageManager.delete('settings', setting.key)
    }
    
    // Reload defaults
    await this.loadDefaultSettings()
    
    console.log(`Category ${category} reset to defaults`)
  }

  // Reset all settings
  async resetAll() {
    // Clear cache
    this.cache.clear()
    
    // Clear storage
    const allSettings = await storageManager.getAll('settings')
    for (const setting of allSettings) {
      await storageManager.delete('settings', setting.key)
    }
    
    // Reload defaults
    await this.loadDefaultSettings()
    
    console.log('All settings reset to defaults')
  }

  // Export settings
  async exportSettings() {
    const settings = this.getAll()
    const exportData = {
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Import settings
  async importSettings(jsonData) {
    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.settings) {
        throw new Error('Invalid settings format')
      }
      
      // Import each category
      for (const [category, settings] of Object.entries(importData.settings)) {
        await this.setCategory(category, settings, true)
      }
      
      console.log('Settings imported successfully')
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }

  // Get settings statistics
  getStats() {
    const stats = {
      categories: this.cache.size,
      totalSettings: 0,
      pendingSaves: this.saveTimeouts.size,
      listeners: this.listeners.size
    }
    
    for (const settings of this.cache.values()) {
      stats.totalSettings += Object.keys(settings).length
    }
    
    return stats
  }
}

// Create singleton instance
export const settingsStorage = new SettingsStorage()

export default settingsStorage