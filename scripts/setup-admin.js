import { adminSetup } from "../src/utils/setupAdminUser.js";

async function runSetup() {
  try {
    console.log("🚀 Starting admin user setup...");

    // Run the complete setup
    const result = await adminSetup.setupComplete();

    if (result.success) {
      console.log("✅ Setup completed successfully!");
      console.log(`👤 Admin user ${result.action}: ${result.user.email}`);
      console.log(`🔑 Username: ${result.user.username}`);
      console.log(`🛡️ Role: ${result.user.role}`);
      console.log(`📊 Status: ${result.user.status}`);
      console.log("");
      console.log("⚠️  IMPORTANT: Remember to update the password!");
      console.log("   The default password is: temp_password_change_me");
      console.log("   Please change it immediately after first login.");
      console.log("");
      console.log("🔐 Next steps:");
      console.log(
        "1. Update the password using the updateAdminPassword method"
      );
      console.log("2. Test the login functionality");
      console.log("3. Verify MCP connection is working");
    } else {
      console.error("❌ Setup failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Setup error:", error);
  }
}

// Run the setup
runSetup();
