// User Permissions and Role-Based Access Control
export class UserPermissions {
  static PERMISSIONS = {
    // Dashboard permissions
    DASHBOARD_VIEW: 'dashboard_view',
    DASHBOARD_ANALYTICS: 'dashboard_analytics',
    
    // User management permissions
    USERS_VIEW: 'users_view',
    USERS_CREATE: 'users_create',
    USERS_EDIT: 'users_edit',
    USERS_DELETE: 'users_delete',
    USERS_MANAGE_ROLES: 'users_manage_roles',
    USERS_MANAGE_MFA: 'users_manage_mfa',
    
    // Blog management permissions
    BLOG_VIEW: 'blog_view',
    BLOG_CREATE: 'blog_create',
    BLOG_EDIT: 'blog_edit',
    BLOG_EDIT_OWN: 'blog_edit_own',
    BLOG_DELETE: 'blog_delete',
    BLOG_PUBLISH: 'blog_publish',
    BLOG_MANAGE: 'blog_manage',
    
    // Settings permissions
    SETTINGS_VIEW: 'settings_view',
    SETTINGS_SECURITY: 'settings_security',
    SETTINGS_SEO: 'settings_seo',
    SETTINGS_PERFORMANCE: 'settings_performance',
    SETTINGS_ANALYTICS: 'settings_analytics',
    SETTINGS_BACKUP: 'settings_backup',
    
    // System permissions
    SYSTEM_ADMIN: 'system_admin',
    SYSTEM_LOGS: 'system_logs',
    SYSTEM_MONITORING: 'system_monitoring',
    
    // AI Tools permissions
    AI_TOOLS_USE: 'ai_tools_use',
    AI_TOOLS_CONFIGURE: 'ai_tools_configure',
    
    // Special permissions
    ALL: 'all' // Root admin permission
  }

  static ROLES = {
    ROOT_ADMIN: {
      name: 'Root Administrator',
      permissions: [UserPermissions.PERMISSIONS.ALL],
      description: 'Complete system access with all permissions',
      color: 'red',
      level: 100
    },
    ADMIN: {
      name: 'Administrator',
      permissions: [
        UserPermissions.PERMISSIONS.DASHBOARD_VIEW,
        UserPermissions.PERMISSIONS.DASHBOARD_ANALYTICS,
        UserPermissions.PERMISSIONS.USERS_VIEW,
        UserPermissions.PERMISSIONS.USERS_CREATE,
        UserPermissions.PERMISSIONS.USERS_EDIT,
        UserPermissions.PERMISSIONS.USERS_MANAGE_MFA,
        UserPermissions.PERMISSIONS.BLOG_VIEW,
        UserPermissions.PERMISSIONS.BLOG_CREATE,
        UserPermissions.PERMISSIONS.BLOG_EDIT,
        UserPermissions.PERMISSIONS.BLOG_DELETE,
        UserPermissions.PERMISSIONS.BLOG_PUBLISH,
        UserPermissions.PERMISSIONS.BLOG_MANAGE,
        UserPermissions.PERMISSIONS.SETTINGS_VIEW,
        UserPermissions.PERMISSIONS.SETTINGS_SEO,
        UserPermissions.PERMISSIONS.SETTINGS_PERFORMANCE,
        UserPermissions.PERMISSIONS.SETTINGS_ANALYTICS,
        UserPermissions.PERMISSIONS.AI_TOOLS_USE,
        UserPermissions.PERMISSIONS.AI_TOOLS_CONFIGURE,
        UserPermissions.PERMISSIONS.SYSTEM_LOGS,
        UserPermissions.PERMISSIONS.SYSTEM_MONITORING
      ],
      description: 'Administrative access with user and content management',
      color: 'purple',
      level: 80
    },
    EDITOR: {
      name: 'Editor',
      permissions: [
        UserPermissions.PERMISSIONS.DASHBOARD_VIEW,
        UserPermissions.PERMISSIONS.BLOG_VIEW,
        UserPermissions.PERMISSIONS.BLOG_CREATE,
        UserPermissions.PERMISSIONS.BLOG_EDIT,
        UserPermissions.PERMISSIONS.BLOG_PUBLISH,
        UserPermissions.PERMISSIONS.AI_TOOLS_USE
      ],
      description: 'Content creation and editing with publishing rights',
      color: 'blue',
      level: 60
    },
    AUTHOR: {
      name: 'Author',
      permissions: [
        UserPermissions.PERMISSIONS.DASHBOARD_VIEW,
        UserPermissions.PERMISSIONS.BLOG_VIEW,
        UserPermissions.PERMISSIONS.BLOG_CREATE,
        UserPermissions.PERMISSIONS.BLOG_EDIT_OWN,
        UserPermissions.PERMISSIONS.AI_TOOLS_USE
      ],
      description: 'Content creation with ability to edit own posts',
      color: 'green',
      level: 40
    },
    CONTRIBUTOR: {
      name: 'Contributor',
      permissions: [
        UserPermissions.PERMISSIONS.DASHBOARD_VIEW,
        UserPermissions.PERMISSIONS.BLOG_VIEW,
        UserPermissions.PERMISSIONS.BLOG_CREATE
      ],
      description: 'Can create content but requires approval to publish',
      color: 'yellow',
      level: 30
    },
    VIEWER: {
      name: 'Viewer',
      permissions: [
        UserPermissions.PERMISSIONS.DASHBOARD_VIEW,
        UserPermissions.PERMISSIONS.BLOG_VIEW
      ],
      description: 'Read-only access to dashboard and content',
      color: 'gray',
      level: 10
    }
  }

  // Check if user has specific permission
  static hasPermission(user, permission) {
    if (!user || !user.role) return false
    
    const role = UserPermissions.ROLES[user.role.toUpperCase()]
    if (!role) return false
    
    // Root admin has all permissions
    if (role.permissions.includes(UserPermissions.PERMISSIONS.ALL)) {
      return true
    }
    
    return role.permissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(user, permissions) {
    return permissions.some(permission => 
      UserPermissions.hasPermission(user, permission)
    )
  }

  // Check if user has all of the specified permissions
  static hasAllPermissions(user, permissions) {
    return permissions.every(permission => 
      UserPermissions.hasPermission(user, permission)
    )
  }

  // Get user's role information
  static getUserRole(user) {
    if (!user || !user.role) return null
    return UserPermissions.ROLES[user.role.toUpperCase()] || null
  }

  // Get all permissions for a user
  static getUserPermissions(user) {
    const role = UserPermissions.getUserRole(user)
    if (!role) return []
    
    if (role.permissions.includes(UserPermissions.PERMISSIONS.ALL)) {
      return Object.values(UserPermissions.PERMISSIONS)
    }
    
    return role.permissions
  }

  // Check if user can manage another user
  static canManageUser(currentUser, targetUser) {
    if (!currentUser || !targetUser) return false
    
    const currentRole = UserPermissions.getUserRole(currentUser)
    const targetRole = UserPermissions.getUserRole(targetUser)
    
    if (!currentRole || !targetRole) return false
    
    // Users can always manage themselves (for profile updates)
    if (currentUser.id === targetUser.id) return true
    
    // Root admin can manage anyone except other root admins
    if (currentRole.level === 100) {
      return targetRole.level < 100
    }
    
    // Admins can manage users with lower role levels
    if (UserPermissions.hasPermission(currentUser, UserPermissions.PERMISSIONS.USERS_EDIT)) {
      return currentRole.level > targetRole.level
    }
    
    return false
  }

  // Check if user can assign a specific role
  static canAssignRole(currentUser, roleToAssign) {
    if (!currentUser) return false
    
    const currentRole = UserPermissions.getUserRole(currentUser)
    const targetRole = UserPermissions.ROLES[roleToAssign.toUpperCase()]
    
    if (!currentRole || !targetRole) return false
    
    // Root admin can assign any role except root admin
    if (currentRole.level === 100) {
      return targetRole.level < 100
    }
    
    // Admins can assign roles with lower levels than their own
    if (UserPermissions.hasPermission(currentUser, UserPermissions.PERMISSIONS.USERS_MANAGE_ROLES)) {
      return currentRole.level > targetRole.level
    }
    
    return false
  }

  // Get available roles that a user can assign
  static getAssignableRoles(currentUser) {
    if (!currentUser) return []
    
    const currentRole = UserPermissions.getUserRole(currentUser)
    if (!currentRole) return []
    
    return Object.entries(UserPermissions.ROLES)
      .filter(([roleKey, role]) => {
        if (currentRole.level === 100) {
          return role.level < 100 // Root admin can assign all except root admin
        }
        return currentRole.level > role.level
      })
      .map(([roleKey, role]) => ({
        key: roleKey.toLowerCase(),
        ...role
      }))
  }

  // Validate permission string
  static isValidPermission(permission) {
    return Object.values(UserPermissions.PERMISSIONS).includes(permission)
  }

  // Get permission description
  static getPermissionDescription(permission) {
    const descriptions = {
      [UserPermissions.PERMISSIONS.DASHBOARD_VIEW]: 'View dashboard and basic analytics',
      [UserPermissions.PERMISSIONS.DASHBOARD_ANALYTICS]: 'Access detailed analytics and reports',
      [UserPermissions.PERMISSIONS.USERS_VIEW]: 'View user list and profiles',
      [UserPermissions.PERMISSIONS.USERS_CREATE]: 'Create new user accounts',
      [UserPermissions.PERMISSIONS.USERS_EDIT]: 'Edit user profiles and settings',
      [UserPermissions.PERMISSIONS.USERS_DELETE]: 'Delete user accounts',
      [UserPermissions.PERMISSIONS.USERS_MANAGE_ROLES]: 'Assign and modify user roles',
      [UserPermissions.PERMISSIONS.USERS_MANAGE_MFA]: 'Manage two-factor authentication settings',
      [UserPermissions.PERMISSIONS.BLOG_VIEW]: 'View blog posts and content',
      [UserPermissions.PERMISSIONS.BLOG_CREATE]: 'Create new blog posts',
      [UserPermissions.PERMISSIONS.BLOG_EDIT]: 'Edit any blog post',
      [UserPermissions.PERMISSIONS.BLOG_EDIT_OWN]: 'Edit own blog posts only',
      [UserPermissions.PERMISSIONS.BLOG_DELETE]: 'Delete blog posts',
      [UserPermissions.PERMISSIONS.BLOG_PUBLISH]: 'Publish and unpublish posts',
      [UserPermissions.PERMISSIONS.BLOG_MANAGE]: 'Full blog management access',
      [UserPermissions.PERMISSIONS.SETTINGS_VIEW]: 'View system settings',
      [UserPermissions.PERMISSIONS.SETTINGS_SECURITY]: 'Modify security settings',
      [UserPermissions.PERMISSIONS.SETTINGS_SEO]: 'Configure SEO settings',
      [UserPermissions.PERMISSIONS.SETTINGS_PERFORMANCE]: 'Adjust performance settings',
      [UserPermissions.PERMISSIONS.SETTINGS_ANALYTICS]: 'Configure analytics settings',
      [UserPermissions.PERMISSIONS.SETTINGS_BACKUP]: 'Manage backup and recovery',
      [UserPermissions.PERMISSIONS.SYSTEM_ADMIN]: 'System administration access',
      [UserPermissions.PERMISSIONS.SYSTEM_LOGS]: 'View system logs and audit trails',
      [UserPermissions.PERMISSIONS.SYSTEM_MONITORING]: 'Access monitoring and health checks',
      [UserPermissions.PERMISSIONS.AI_TOOLS_USE]: 'Use AI tools and features',
      [UserPermissions.PERMISSIONS.AI_TOOLS_CONFIGURE]: 'Configure AI tools and settings',
      [UserPermissions.PERMISSIONS.ALL]: 'Complete system access (Root Admin only)'
    }
    
    return descriptions[permission] || 'Unknown permission'
  }

  // Create permission middleware for route protection
  static createPermissionMiddleware(requiredPermissions) {
    return (user) => {
      if (!user) return false
      
      if (Array.isArray(requiredPermissions)) {
        return UserPermissions.hasAnyPermission(user, requiredPermissions)
      }
      
      return UserPermissions.hasPermission(user, requiredPermissions)
    }
  }
}

export default UserPermissions