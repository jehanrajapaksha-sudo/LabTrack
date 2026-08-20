require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

/**
 * Updates the existing admin name, email, and password from ADMIN_* in .env.
 * Run: npm run update-admin
 */
async function updateAdmin() {
  const name = process.env.ADMIN_NAME || 'System Admin';
  const email = (process.env.ADMIN_EMAIL || 'admin@labreport.local').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 6) {
    console.error('ADMIN_PASSWORD must be at least 6 characters in .env');
    process.exit(1);
  }

  await sequelize.authenticate();
  await sequelize.sync();

  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    console.error('No admin account found. Run npm run create-admin first.');
    process.exit(1);
  }

  admin.name = name;
  admin.email = email;
  admin.password = await bcrypt.hash(password, 10);
  await admin.save();

  console.log(`Admin updated: ${email}`);
  process.exit(0);
}

updateAdmin().catch((err) => {
  console.error('Could not update admin:', err.message);
  process.exit(1);
});
