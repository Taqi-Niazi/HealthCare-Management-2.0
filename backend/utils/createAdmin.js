const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("✔ Admin already exists:", adminExists.email);
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await User.create({
      name: "System Admin",
      email: "admin@hcms.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("🚀 Default Admin Created:");
    console.log("Email: admin@hcms.com");
    console.log("Password: admin123");
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  }
}

module.exports = createDefaultAdmin;
