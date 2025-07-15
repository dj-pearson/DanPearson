import { supabase } from "./SupabaseAuthService.js";

export class AdminUserSetup {
  constructor() {
    this.supabase = supabase;
  }

  // Create admin_users table if it doesn't exist
  async createAdminUsersTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS admin_users (
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
    `;

    try {
      const { error } = await this.supabase.rpc("exec_sql", {
        sql: createTableSQL,
      });
      if (error) {
        console.error("Error creating admin_users table:", error);
        return { success: false, error: error.message };
      }
      console.log("admin_users table created successfully");
      return { success: true };
    } catch (error) {
      console.error("Error creating admin_users table:", error);
      return { success: false, error: error.message };
    }
  }

  // Create admin_sessions table if it doesn't exist
  async createAdminSessionsTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    try {
      const { error } = await this.supabase.rpc("exec_sql", {
        sql: createTableSQL,
      });
      if (error) {
        console.error("Error creating admin_sessions table:", error);
        return { success: false, error: error.message };
      }
      console.log("admin_sessions table created successfully");
      return { success: true };
    } catch (error) {
      console.error("Error creating admin_sessions table:", error);
      return { success: false, error: error.message };
    }
  }

  // Check if admin user exists
  async checkAdminUserExists(email = "pearsonperformance@gmail.com") {
    try {
      const { data, error } = await this.supabase
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking admin user:", error);
        return { exists: false, error: error.message };
      }

      return { exists: !!data, user: data };
    } catch (error) {
      console.error("Error checking admin user:", error);
      return { exists: false, error: error.message };
    }
  }

  // Create or update admin user
  async createAdminUser(adminData = {}) {
    const defaultAdminData = {
      email: "pearsonperformance@gmail.com",
      username: "admin",
      password_hash: "temp_password_change_me", // You should hash this properly
      role: "root_admin",
      status: "active",
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const userData = { ...defaultAdminData, ...adminData };

    try {
      // Check if user already exists
      const { exists, user } = await this.checkAdminUserExists(userData.email);

      if (exists) {
        // Update existing user
        const { data, error } = await this.supabase
          .from("admin_users")
          .update({
            username: userData.username,
            role: userData.role,
            status: userData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("email", userData.email)
          .select();

        if (error) {
          console.error("Error updating admin user:", error);
          return { success: false, error: error.message };
        }

        console.log("Admin user updated successfully:", data[0]);
        return { success: true, user: data[0], action: "updated" };
      } else {
        // Create new user
        const { data, error } = await this.supabase
          .from("admin_users")
          .insert([userData])
          .select();

        if (error) {
          console.error("Error creating admin user:", error);
          return { success: false, error: error.message };
        }

        console.log("Admin user created successfully:", data[0]);
        return { success: true, user: data[0], action: "created" };
      }
    } catch (error) {
      console.error("Error creating/updating admin user:", error);
      return { success: false, error: error.message };
    }
  }

  // Complete setup process
  async setupComplete() {
    try {
      console.log("Starting admin user setup...");

      // Create tables
      const tableResult1 = await this.createAdminUsersTable();
      if (!tableResult1.success) {
        return tableResult1;
      }

      const tableResult2 = await this.createAdminSessionsTable();
      if (!tableResult2.success) {
        return tableResult2;
      }

      // Create admin user
      const userResult = await this.createAdminUser();
      if (!userResult.success) {
        return userResult;
      }

      console.log("Admin user setup completed successfully!");
      return {
        success: true,
        message: "Admin user setup completed successfully",
        user: userResult.user,
        action: userResult.action,
      };
    } catch (error) {
      console.error("Error during admin setup:", error);
      return { success: false, error: error.message };
    }
  }

  // Get admin user for authentication
  async getAdminUser(email = "pearsonperformance@gmail.com") {
    try {
      const { data, error } = await this.supabase
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        console.error("Error getting admin user:", error);
        return { success: false, error: error.message };
      }

      return { success: true, user: data };
    } catch (error) {
      console.error("Error getting admin user:", error);
      return { success: false, error: error.message };
    }
  }

  // Update admin password (remember to hash in production)
  async updateAdminPassword(email, newPassword) {
    try {
      // In production, hash the password before storing
      const hashedPassword = newPassword; // Replace with actual hashing

      const { data, error } = await this.supabase
        .from("admin_users")
        .update({
          password_hash: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email)
        .select();

      if (error) {
        console.error("Error updating admin password:", error);
        return { success: false, error: error.message };
      }

      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      console.error("Error updating admin password:", error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
export const adminSetup = new AdminUserSetup();

// Usage example:
// import { adminSetup } from './setupAdminUser.js'
// const result = await adminSetup.setupComplete()
// console.log(result)
