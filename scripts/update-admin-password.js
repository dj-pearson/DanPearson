import { adminSetup } from "../src/utils/setupAdminUser.js";
import { createInterface } from "readline";

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to get user input
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function updatePassword() {
  try {
    console.log("🔐 Admin Password Update");
    console.log("======================");

    // Get admin email
    const email = await question(
      "Enter admin email (press Enter for pearsonperformance@gmail.com): "
    );
    const adminEmail = email.trim() || "pearsonperformance@gmail.com";

    // Get new password
    const newPassword = await question("Enter new password: ");

    if (!newPassword.trim()) {
      console.log("❌ Password cannot be empty");
      rl.close();
      return;
    }

    // Update password
    console.log("🔄 Updating password...");
    const result = await adminSetup.updateAdminPassword(
      adminEmail,
      newPassword
    );

    if (result.success) {
      console.log("✅ Password updated successfully!");
      console.log(`👤 Email: ${adminEmail}`);
      console.log("🔐 You can now use the new password to login");
    } else {
      console.error("❌ Failed to update password:", result.error);
    }

    rl.close();
  } catch (error) {
    console.error("❌ Error:", error);
    rl.close();
  }
}

// Run the password update
updatePassword();
