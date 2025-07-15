
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Edit, Trash2, Shield, Key, Smartphone, Eye, EyeOff } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { EmailService } from '../../utils/EmailService'
import MFASetup from '../../components/MFASetup'

const AdminUsers = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin',
      email: 'pearsonperformance@gmail.com',
      role: 'root_admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      mfaEnabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      permissions: ['all']
    }
  ])

  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'editor',
    permissions: []
  })
  const [showMFASetup, setShowMFASetup] = useState(null)
  const [sendingReset, setSendingReset] = useState(null)

  const roles = [
    { value: 'root_admin', label: 'Root Admin', permissions: ['all'] },
    { value: 'admin', label: 'Admin', permissions: ['blog', 'users', 'settings'] },
    { value: 'editor', label: 'Editor', permissions: ['blog'] },
    { value: 'viewer', label: 'Viewer', permissions: ['view'] }
  ]

  const permissions = [
    { value: 'blog', label: 'Blog Management' },
    { value: 'users', label: 'User Management' },
    { value: 'settings', label: 'System Settings' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'security', label: 'Security Settings' }
  ]

  const sendPasswordReset = async (user) => {
    setSendingReset(user.id)
    try {
      const result = await EmailService.sendPasswordResetEmail(user.email)
      if (result.success) {
        toast.success(`Password reset email sent to ${user.email}`)
        // For demo purposes, show the reset link
        if (result.resetLink) {
          toast.success(`Demo Reset Link: ${result.resetLink}`, { duration: 10000 })
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to send password reset email')
    } finally {
      setSendingReset(null)
    }
  }

  const handleEditProfile = (user) => {
    if (user.id === 1) { // Root admin
      setEditingUser(user)
      setNewUser({
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      })
    } else {
      handleEditUser(user)
    }
  }

  const handleAddUser = () => {
    const user = {
      id: Date.now(),
      ...newUser,
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }

    setUsers([...users, user])
    setNewUser({ username: '', email: '', password: '', role: 'editor', permissions: [] })
    setShowAddUser(false)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setNewUser({
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      password: '' // Allow password change
    })
  }

  const handleUpdateUser = () => {
    const updatedUser = { ...editingUser, ...newUser }

    // Only update password if provided
    if (!newUser.password || newUser.password.trim() === '') {
      delete updatedUser.password
    }

    setUsers(users.map(user =>
      user.id === editingUser.id ? updatedUser : user
    ))

    setEditingUser(null)
    setNewUser({ username: '', email: '', password: '', role: 'editor', permissions: [] })
  }

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => u.id === userId)
    if (userToDelete?.role === 'root_admin') {
      alert('Cannot delete root admin user')
      return
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId))
    }
  }

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ))
  }

  const toggleMFA = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, mfaEnabled: !user.mfaEnabled }
        : user
    ))
  }

  const generateMFASecret = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
            <p className="text-gray-400">Manage user accounts, roles, and permissions</p>
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  MFA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'root_admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {roles.find(r => r.value === user.role)?.label || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleMFA(user.id)}
                      className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        user.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <Smartphone size={12} />
                      {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => sendPasswordReset(user)}
                        disabled={sendingReset === user.id}
                        className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                        title="Send Password Reset"
                      >
                        <Key size={16} className={sendingReset === user.id ? 'animate-spin' : ''} />
                      </button>

                      <button
                        onClick={() => setShowMFASetup(user)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Manage MFA"
                      >
                        <Smartphone size={16} />
                      </button>

                      {user.id !== 1 && ( // Don't allow deleting root admin
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit User Modal */}
        {(showAddUser || editingUser) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter new password or leave blank"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => {
                      const selectedRole = roles.find(r => r.value === e.target.value)
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                        permissions: selectedRole?.permissions || []
                      })
                    }}
                    disabled={editingUser?.id === 1} // Can't change root admin role
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {editingUser?.id === 1 && (
                    <p className="text-xs text-gray-400 mt-1">Root admin role cannot be changed</p>
                  )}
                </div>

                {/* Permissions */}
                {newUser.role !== 'root_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Permissions
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {permissions.map((permission) => (
                        <label key={permission.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newUser.permissions.includes(permission.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUser({
                                  ...newUser,
                                  permissions: [...newUser.permissions, permission.value]
                                })
                              } else {
                                setNewUser({
                                  ...newUser,
                                  permissions: newUser.permissions.filter(p => p !== permission.value)
                                })
                              }
                            }}
                            className="mr-2 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-300">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddUser(false)
                    setEditingUser(null)
                    setNewUser({ username: '', email: '', password: '', role: 'editor', permissions: [] })
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  disabled={!newUser.username || !newUser.email || (!editingUser && !newUser.password)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingUser ? 'Update' : 'Add'} User
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MFA Setup Modal */}
        {showMFASetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <MFASetup
                user={showMFASetup}
                onComplete={() => {
                  setShowMFASetup(null)
                  // Refresh user data
                  const updatedUsers = users.map(u =>
                    u.id === showMFASetup.id ? { ...u, mfaEnabled: true } : u
                  )
                  setUsers(updatedUsers)
                }}
                onCancel={() => setShowMFASetup(null)}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminUsers
