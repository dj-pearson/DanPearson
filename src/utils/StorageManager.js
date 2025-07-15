
// Advanced Storage Manager with IndexedDB and localStorage fallback
export class StorageManager {
  constructor() {
    this.dbName = 'DanPearsonPortfolio'
    this.dbVersion = 1
    this.db = null
    this.isIndexedDBSupported = this.checkIndexedDBSupport()
    this.stores = {
      users: 'users',
      settings: 'settings',
      blogPosts: 'blogPosts',
      sessions: 'sessions',
      logs: 'logs'
    }
  }

  // Check if IndexedDB is supported
  checkIndexedDBSupport() {
    return 'indexedDB' in window && indexedDB !== null
  }

  // Initialize storage system
  async initialize() {
    if (this.isIndexedDBSupported) {
      await this.initIndexedDB()
    } else {
      console.warn('IndexedDB not supported, falling back to localStorage')
    }

    // Initialize root admin user if not exists
    await this.initializeRootAdmin()

    // Migrate existing localStorage data if needed
    await this.migrateExistingData()

    console.log('Storage Manager initialized successfully')
  }

  // Initialize IndexedDB
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB opened successfully')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object stores
        if (!db.objectStoreNames.contains(this.stores.users)) {
          const userStore = db.createObjectStore(this.stores.users, { keyPath: 'id', autoIncrement: true })
          userStore.createIndex('email', 'email', { unique: true })
          userStore.createIndex('username', 'username', { unique: true })
        }

        if (!db.objectStoreNames.contains(this.stores.settings)) {
          const settingsStore = db.createObjectStore(this.stores.settings, { keyPath: 'key' })
          settingsStore.createIndex('category', 'category', { unique: false })
        }

        if (!db.objectStoreNames.contains(this.stores.blogPosts)) {
          const blogStore = db.createObjectStore(this.stores.blogPosts, { keyPath: 'id', autoIncrement: true })
          blogStore.createIndex('slug', 'slug', { unique: true })
          blogStore.createIndex('published', 'published', { unique: false })
        }

        if (!db.objectStoreNames.contains(this.stores.sessions)) {
          const sessionStore = db.createObjectStore(this.stores.sessions, { keyPath: 'id' })
          sessionStore.createIndex('userId', 'userId', { unique: false })
          sessionStore.createIndex('expiresAt', 'expiresAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(this.stores.logs)) {
          const logStore = db.createObjectStore(this.stores.logs, { keyPath: 'id', autoIncrement: true })
          logStore.createIndex('timestamp', 'timestamp', { unique: false })
          logStore.createIndex('level', 'level', { unique: false })
        }

        console.log('IndexedDB schema created/updated')
      }
    })
  }

  // Generic get method
  async get(storeName, key) {
    if (this.isIndexedDBSupported && this.db) {
      return await this.getFromIndexedDB(storeName, key)
    } else {
      return this.getFromLocalStorage(storeName, key)
    }
  }

  // Generic set method
  async set(storeName, data, key = null) {
    if (this.isIndexedDBSupported && this.db) {
      return await this.setToIndexedDB(storeName, data, key)
    } else {
      return this.setToLocalStorage(storeName, data, key)
    }
  }

  // Generic delete method
  async delete(storeName, key) {
    if (this.isIndexedDBSupported && this.db) {
      return await this.deleteFromIndexedDB(storeName, key)
    } else {
      return this.deleteFromLocalStorage(storeName, key)
    }
  }

  // Generic getAll method
  async getAll(storeName) {
    if (this.isIndexedDBSupported && this.db) {
      return await this.getAllFromIndexedDB(storeName)
    } else {
      return this.getAllFromLocalStorage(storeName)
    }
  }

  // IndexedDB operations
  async getFromIndexedDB(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async setToIndexedDB(storeName, data, key = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)

      if (key && !data.hasOwnProperty(store.keyPath)) {
        data[store.keyPath] = key
      }

      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteFromIndexedDB(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllFromIndexedDB(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // localStorage operations (fallback)
  getFromLocalStorage(storeName, key) {
    try {
      const storeData = JSON.parse(localStorage.getItem(storeName) || '{}')
      return storeData[key] || null
    } catch (error) {
      console.error('localStorage get error:', error)
      return null
    }
  }

  setToLocalStorage(storeName, data, key = null) {
    try {
      const storeData = JSON.parse(localStorage.getItem(storeName) || '{}')
      const dataKey = key || data.id || Date.now().toString()
      storeData[dataKey] = { ...data, id: dataKey }
      localStorage.setItem(storeName, JSON.stringify(storeData))
      return dataKey
    } catch (error) {
      console.error('localStorage set error:', error)
      return null
    }
  }

  deleteFromLocalStorage(storeName, key) {
    try {
      const storeData = JSON.parse(localStorage.getItem(storeName) || '{}')
      delete storeData[key]
      localStorage.setItem(storeName, JSON.stringify(storeData))
      return true
    } catch (error) {
      console.error('localStorage delete error:', error)
      return false
    }
  }

  getAllFromLocalStorage(storeName) {
    try {
      const storeData = JSON.parse(localStorage.getItem(storeName) || '{}')
      return Object.values(storeData)
    } catch (error) {
      console.error('localStorage getAll error:', error)
      return []
    }
  }

  // Migrate existing localStorage data to new structure
  async migrateExistingData() {
    const migrations = [
      { oldKey: 'admin-settings', newStore: 'settings', newKey: 'admin-settings' },
      { oldKey: 'adminToken', newStore: 'sessions', newKey: 'current-session' },
      { oldKey: 'adminUser', newStore: 'users', newKey: 'current-user' },
      { oldKey: 'aiSettings', newStore: 'settings', newKey: 'ai-settings' }
    ]

    for (const migration of migrations) {
      const oldData = localStorage.getItem(migration.oldKey)
      if (oldData) {
        try {
          const parsedData = JSON.parse(oldData)
          await this.set(migration.newStore, {
            key: migration.newKey,
            value: parsedData,
            migratedAt: new Date().toISOString()
          })
          console.log(`Migrated ${migration.oldKey} to ${migration.newStore}`)
        } catch (error) {
          console.error(`Failed to migrate ${migration.oldKey}:`, error)
        }
      }
    }
  }

  // User-specific methods
  async getUser(id) {
    return await this.get(this.stores.users, id)
  }

  async getUserByEmail(email) {
    try {
      const users = await this.getAll('users')
      return users.find(user => user.email === email || user.username === email)
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  }

  async createUser(userData) {
    try {
      await this.set('users', userData)
      return userData
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async updateUser(userId, updates) {
    try {
      const user = await this.get('users', userId)
      if (!user) throw new Error('User not found')

      const updatedUser = { ...user, ...updates }
      await this.set('users', updatedUser)
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Settings-specific methods
  async getSetting(key) {
    const setting = await this.get(this.stores.settings, key)
    return setting ? setting.value : null
  }

  async setSetting(key, value, category = 'general') {
    return await this.set(this.stores.settings, {
      key,
      value,
      category,
      updatedAt: new Date().toISOString()
    })
  }

  async getSettingsByCategory(category) {
    if (this.isIndexedDBSupported && this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.stores.settings], 'readonly')
        const store = transaction.objectStore(this.stores.settings)
        const index = store.index('category')
        const request = index.getAll(category)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } else {
      const settings = await this.getAll(this.stores.settings)
      return settings.filter(setting => setting.category === category)
    }
  }

  // Session management
  async createSession(userId, token, expiresAt) {
    try {
      const session = {
        id: token,
        userId,
        token,
        expiresAt,
        createdAt: new Date().toISOString()
      }

      await this.set('sessions', session)
      return session
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  async getSession(token) {
    try {
      return await this.get('sessions', token)
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  async deleteSession(token) {
    try {
      await this.delete('sessions', token)
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions() {
    const sessions = await this.getAll(this.stores.sessions)
    const now = new Date()

    for (const session of sessions) {
      if (new Date(session.expiresAt) < now) {
        await this.deleteSession(session.id)
      }
    }
  }

  // Logging
  async log(level, message, data = {}) {
    try {
      const logEntry = {
        id: Date.now(),
        level,
        message,
        data,
        timestamp: new Date().toISOString()
      }

      await this.set('logs', logEntry)
    } catch (error) {
      console.error('Error logging:', error)
    }
  }

  // Export data
  async exportData() {
    const data = {}

    for (const storeName of Object.values(this.stores)) {
      data[storeName] = await this.getAll(storeName)
    }

    return {
      ...data,
      exportedAt: new Date().toISOString(),
      version: this.dbVersion
    }
  }

  // Import data
  async importData(data) {
    for (const [storeName, items] of Object.entries(data)) {
      if (Object.values(this.stores).includes(storeName) && Array.isArray(items)) {
        for (const item of items) {
          await this.set(storeName, item)
        }
      }
    }
  }

  // Clear all data
  async clearAllData() {
    if (this.isIndexedDBSupported && this.db) {
      for (const storeName of Object.values(this.stores)) {
        const transaction = this.db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        await new Promise((resolve, reject) => {
          const request = store.clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }
    } else {
      for (const storeName of Object.values(this.stores)) {
        localStorage.removeItem(storeName)
      }
    }

    // Also clear legacy localStorage items
    const legacyKeys = ['admin-settings', 'adminToken', 'adminUser', 'aiSettings']
    legacyKeys.forEach(key => localStorage.removeItem(key))
  }

  async initializeRootAdmin() {
    try {
      const rootAdmin = await this.getUserByEmail('pearsonperformance@gmail.com')

      if (!rootAdmin) {
        const adminUser = {
          id: 1,
          username: 'admin',
          email: 'pearsonperformance@gmail.com',
          password: 'admin123', // In production, this should be hashed
          role: 'root_admin',
          permissions: ['all'],
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: null,
          loginAttempts: 0,
          twoFactorEnabled: false,
          mfaSecret: null
        }

        await this.createUser(adminUser)
        console.log('Root admin user created: pearsonperformance@gmail.com')
      }
    } catch (error) {
      console.error('Failed to initialize root admin:', error)
    }
  }
}

// Create singleton instance
export const storageManager = new StorageManager()

export default storageManager
