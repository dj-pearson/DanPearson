import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { TwoFactorAuth } from '../utils/TwoFactorAuth'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUsers()
    loadCurrentUser()
  }, [])

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('admin-users') || '[]')
    if (savedUsers.length === 0) {
      // Initialize with root admin
      const rootAdmin = {
        id: 1,
        email: 'pearsonperformance@gmail.com',
        name: 'Dan Pearson',
        role: 'root_admin',
        status: 'active',
        mfaEnabled: false,
        mfaSecret: null,
        backupCodes: [],
        lastLogin: null,
        createdAt: new Date().toISOString(),
        permissions: {
          users: { create: true, read: true, update: true, delete: true },
          blog: { create: true, read: true, update: true, delete: true },
          security: { create: true, read: true, update: true, delete: true },
          analytics: { create: true, read: true, update: true, delete: true },
          settings: { create: true, read: true, update: true, delete: true }
        }
      }
      const initialUsers = [rootAdmin]
      localStorage.setItem('admin-users', JSON.stringify(initialUsers))
      setUsers(initialUsers)
    } else {
      setUsers(savedUsers)
    }
  }

  const loadCurrentUser = () => {
    const savedUser = JSON.parse(localStorage.getItem('current-admin-user') || 'null')
    setCurrentUser(savedUser)
  }

  const saveUsers = (updatedUsers) => {
    localStorage.setItem('admin-users', JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
  }

  const createUser = async (userData) => {
    setIsLoading(true)
    try {
      const newUser = {
        id: Date.now(),
        ...userData,
        status: 'active',
        mfaEnabled: false,
        mfaSecret: null,
        backupCodes: [],
        lastLogin: null,
        createdAt: new Date().toISOString(),
        permissions: userData.permissions || {
          users: { create: false, read: true, update: false, delete: false },
          blog: { create: true, read: true, update: true, delete: false },
          security: { create: false, read: true, update: false, delete: false },
          analytics: { create: false, read: true, update: false, delete: false },
          settings: { create: false, read: true, update: false, delete: false }
        }
      }
      
      const updatedUsers = [...users, newUser]
      saveUsers(updatedUsers)
      
      // Log security event
      const logEntry = {
        id: Date.now(),
        action: `User Created: ${newUser.email}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: 'success',
        details: { userId: newUser.id, role: newUser.role }
      }
      
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('security-logs', JSON.stringify(logs))
      
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Failed to create user:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userId, updates) => {
    setIsLoading(true)
    try {
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
      )
      saveUsers(updatedUsers)
      
      // Update current user if it's the same user
      if (currentUser && currentUser.id === userId) {
        const updatedCurrentUser = { ...currentUser, ...updates }
        setCurrentUser(updatedCurrentUser)
        localStorage.setItem('current-admin-user', JSON.stringify(updatedCurrentUser))
      }
      
      // Log security event
      const logEntry = {
        id: Date.now(),
        action: `User Updated: ${updates.email || 'User ID ' + userId}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: 'success',
        details: { userId, changes: Object.keys(updates) }
      }
      
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('security-logs', JSON.stringify(logs))
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update user:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    setIsLoading(true)
    try {
      const userToDelete = users.find(user => user.id === userId)
      if (!userToDelete) {
        throw new Error('User not found')
      }
      
      if (userToDelete.role === 'root_admin') {
        throw new Error('Cannot delete root admin user')
      }
      
      const updatedUsers = users.filter(user => user.id !== userId)
      saveUsers(updatedUsers)
      
      // Log security event
      const logEntry = {
        id: Date.now(),
        action: `User Deleted: ${userToDelete.email}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: 'success',
        details: { userId, email: userToDelete.email }
      }
      
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('security-logs', JSON.stringify(logs))
      
      return { success: true }
    } catch (error) {
      console.error('Failed to delete user:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const setupMFA = async (userId) => {
    setIsLoading(true)
    try {
      const user = users.find(u => u.id === userId)
      if (!user) {
        throw new Error('User not found')
      }
      
      const secretData = TwoFactorAuth.generateSecret(user.email)
      const qrCodeData = await TwoFactorAuth.generateQRCode(secretData.base32, user.email)
      
      // Store secret temporarily (will be confirmed after verification)
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, mfaSecret: secretData.base32, mfaSetupPending: true } : u
      )
      saveUsers(updatedUsers)
      
      return {
        success: true,
        secret: secretData.base32,
        qrCode: qrCodeData.qrCodeUrl
      }
    } catch (error) {
      console.error('Failed to setup MFA:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyMFA = async (userId, token) => {
    setIsLoading(true)
    try {
      const user = users.find(u => u.id === userId)
      if (!user || !user.mfaSecret) {
        throw new Error('MFA setup not found')
      }
      
      const isValid = TwoFactorAuth.verifyToken(user.mfaSecret, token)
      if (!isValid) {
        throw new Error('Invalid verification code')
      }
      
      // Generate backup codes
      const backupCodes = TwoFactorAuth.generateBackupCodes()
      
      // Enable MFA
      const updatedUsers = users.map(u => 
        u.id === userId ? {
          ...u,
          mfaEnabled: true,
          mfaSetupPending: false,
          backupCodes: backupCodes.map(code => ({ code, used: false }))
        } : u
      )
      saveUsers(updatedUsers)
      
      // Log security event
      const logEntry = {
        id: Date.now(),
        action: `MFA Enabled: ${user.email}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: 'success',
        details: { userId }
      }
      
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('security-logs', JSON.stringify(logs))
      
      return { success: true, backupCodes }
    } catch (error) {
      console.error('Failed to verify MFA:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const disableMFA = async (userId) => {
    setIsLoading(true)
    try {
      const user = users.find(u => u.id === userId)
      if (!user) {
        throw new Error('User not found')
      }
      
      const updatedUsers = users.map(u => 
        u.id === userId ? {
          ...u,
          mfaEnabled: false,
          mfaSecret: null,
          backupCodes: [],
          mfaSetupPending: false
        } : u
      )
      saveUsers(updatedUsers)
      
      // Log security event
      const logEntry = {
        id: Date.now(),
        action: `MFA Disabled: ${user.email}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: 'success',
        details: { userId }
      }
      
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('security-logs', JSON.stringify(logs))
      
      return { success: true }
    } catch (error) {
      console.error('Failed to disable MFA:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password, mfaToken = null) => {
    setIsLoading(true)
    try {
      const user = users.find(u => u.email === email)
      if (!user) {
        throw new Error('Invalid credentials')
      }
      
      if (user.status !== 'active') {
        throw new Error('Account is disabled')
      }
      
      // In production, verify password hash
      // For demo, accept any password for existing users
      
      // Check MFA if enabled
      if (user.mfaEnabled) {
        if (!mfaToken) {
          return { success: false, requireMFA: true }
        }
        
        const isValidMFA = TwoFactorAuth.verifyToken(user.mfaSecret, mfaToken)
        if (!isValidMFA) {
          // Check backup codes
          const validBackupCode = user.backupCodes.find(bc => 
            bc.code === mfaToken.toUpperCase() && !bc.used
          )
          
          if (!validBackupCode) {
            throw new Error('Invalid MFA code')
          }
          
          // Mark backup code as used
          const updatedUsers = users.map(u => 
            u.id === user.id ? {
              ...u,
              backupCodes: u.backupCodes.map(bc => 
                bc.code === mfaToken.toUpperCase() ? { ...bc, used: true } : bc
              )
            } : u
          )
          saveUsers(updatedUsers)
        }
      }
      
      // Update last login
      const updatedUser = { ...user, lastLogin: new Date().toISOString() }
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u)
      saveUsers(updatedUsers)
      
      setCurrentUser(updatedUser)
      localStorage.setItem('current-admin-user', JSON.stringify(updatedUser))
      
      // Log security event
      const logEntry = {
        id: Date.now(),
        action: `User Login: ${user.email}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: 'success',
        details: { userId: user.id }
      }
      
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('security-logs', JSON.stringify(logs))
      
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Login failed:', error)
      
      // Log failed login attempt
      const logEntry = {
        id: Date.now(),
        action: `Failed Login Attempt: ${email}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: 'failed',
        details: { email, error: error.message }
      }
      
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('security-logs', JSON.stringify(logs))
      
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (currentUser) {
      // Log security event
      const logEntry = {
        id: Date.now(),
        action: `User Logout: ${currentUser.email}`,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: 'success',
        details: { userId: currentUser.id }
      }
      
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]')
      logs.push(logEntry)
      localStorage.setItem('security-logs', JSON.stringify(logs))
    }
    
    setCurrentUser(null)
    localStorage.removeItem('current-admin-user')
  }

  const value = {
    users,
    currentUser,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    setupMFA,
    verifyMFA,
    disableMFA,
    login,
    logout
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider