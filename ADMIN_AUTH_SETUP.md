# Admin Authentication Setup Guide

## Overview

This guide will help you set up admin authentication for your Dan Pearson homepage project using Supabase. You'll create the necessary database tables, set up your admin user, and configure secure authentication.

## Current Status

✅ **Supabase project configured**: `qazhdcqvjppbbjxzvisp`  
✅ **MCP server configured**: Connected to Cursor  
✅ **Authentication services**: `SupabaseAuthService.js` ready  
⚠️ **MCP Token**: Currently using service role token (should be personal access token)  
❌ **Admin user**: Not yet created in database

## Step 1: Fix MCP Token (Important!)

You're currently using a **service role token** in your MCP configuration, but you should use a **personal access token** for security.

### Get Personal Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your profile (top right)
3. Go to **Access Tokens**
4. Click **Create New Token**
5. Name it "Cursor MCP Server"
6. Copy the token

### Update MCP Configuration

Replace the `SUPABASE_ACCESS_TOKEN` in `.cursor/mcp.json` with your personal access token:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=qazhdcqvjppbbjxzvisp"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
      }
    }
  }
}
```

## Step 2: Set Up Database Tables and Admin User

### Option A: Automated Setup (Recommended)

Run the setup script to automatically create tables and admin user:

```bash
node scripts/setup-admin.js
```

This will:

- Create `admin_users` table with proper schema
- Create `admin_sessions` table for session management
- Create your admin user with email: `pearsonperformance@gmail.com`
- Set temporary password: `temp_password_change_me`

### Option B: Manual Setup via MCP

Ask Cursor (with MCP enabled) to:

1. **Create admin_users table:**

```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  status VARCHAR(20) DEFAULT 'active',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **Create admin_sessions table:**

```sql
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. **Insert admin user:**

```sql
INSERT INTO admin_users (email, username, password_hash, role, status)
VALUES ('pearsonperformance@gmail.com', 'admin', 'temp_password_change_me', 'root_admin', 'active');
```

## Step 3: Update Admin Password

**Important**: Change the temporary password immediately!

### Option A: Using Script

```bash
node scripts/update-admin-password.js
```

### Option B: Manual Update

1. Open your admin panel
2. Go to user settings
3. Change password from `temp_password_change_me` to your secure password

## Step 4: Test Authentication

### Test Database Connection

Ask Cursor to run:

```sql
SELECT * FROM admin_users WHERE email = 'pearsonperformance@gmail.com';
```

### Test Login Flow

1. Open your admin login page
2. Use credentials:
   - **Email**: `pearsonperformance@gmail.com`
   - **Password**: (your new password)
3. Verify successful login and session creation

## Step 5: Security Verification

### Database Security

- [ ] Admin user created with secure password
- [ ] Session management working
- [ ] Failed login attempts tracked
- [ ] Account lockout after 5 failed attempts

### MCP Security

- [ ] Using personal access token (not service role)
- [ ] Read-only mode enabled
- [ ] Project scoped to your specific project
- [ ] Review tool calls before execution

## File Structure

```
├── src/
│   ├── utils/
│   │   ├── SupabaseAuthService.js      # Main auth service
│   │   ├── setupAdminUser.js           # Database setup utility
│   │   └── SupabaseEmailService.js     # Email service
│   └── contexts/
│       └── AdminContext.jsx            # Admin context provider
├── scripts/
│   ├── setup-admin.js                  # Automated setup script
│   └── update-admin-password.js        # Password update script
├── .cursor/
│   └── mcp.json                        # MCP configuration
└── docs/
    ├── SUPABASE_MCP_SETUP.md          # MCP setup guide
    └── ADMIN_AUTH_SETUP.md            # This file
```

## Usage Examples

### Login from React Component

```javascript
import { useAdmin } from "../contexts/AdminContext";

function LoginComponent() {
  const { login } = useAdmin();

  const handleLogin = async (email, password) => {
    const result = await login({ email, password });
    if (result.success) {
      // Redirect to admin dashboard
    } else {
      // Show error message
    }
  };
}
```

### Check Authentication Status

```javascript
import { useAdmin } from "../contexts/AdminContext";

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return children;
}
```

## Troubleshooting

### Common Issues

1. **MCP Connection Failed**

   - Check personal access token is correct
   - Verify project reference: `qazhdcqvjppbbjxzvisp`
   - Restart Cursor after config changes

2. **Database Connection Error**

   - Ensure tables exist (run setup script)
   - Check Supabase project is active
   - Verify API keys are correct

3. **Login Failed**

   - Check admin user exists in database
   - Verify password is correct
   - Check for account lockout

4. **Session Issues**
   - Clear localStorage
   - Check session expiration
   - Verify admin_sessions table exists

### Getting Help

1. **Check logs**: Browser console and network tab
2. **Test MCP**: Ask Cursor to query your database
3. **Verify tables**: Use Supabase dashboard or MCP queries
4. **Check authentication**: Test login flow step by step

## Security Best Practices

1. **Password Policy**

   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Regular password rotation

2. **Session Security**

   - 24-hour session expiration
   - Secure session tokens
   - Session cleanup on logout

3. **Database Security**

   - Row Level Security (RLS) enabled
   - Encrypted sensitive data
   - Regular security audits

4. **MCP Security**
   - Personal access tokens only
   - Read-only mode for development
   - Review all tool calls before execution

## Next Steps

Once admin authentication is working:

1. **Add role-based permissions**
2. **Implement two-factor authentication**
3. **Set up audit logging**
4. **Create admin dashboard**
5. **Add user management features**

---

**Need help?** Check the troubleshooting section or review the authentication service files for implementation details.
