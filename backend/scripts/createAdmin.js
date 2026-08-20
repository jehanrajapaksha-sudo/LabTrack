require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

/**
 * Creates the first admin account from ADMIN_* values in .env.
 * Run: npm run create-admin
 */
async function createAdmin() {
  const name = process.env.ADMIN_NAME || 'System Admin';
  const email = (process.env.ADMIN_EMAIL || 'admin@labreport.local').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  await sequelize.authenticate();
  await sequelize.sync();

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    if (existing.role !== 'admin') {
      console.log(`A user with ${email} already exists, but is not an admin.`);
      process.exit(1);
    }
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed, role: 'admin' });
  console.log(`Admin created: ${email}`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Could not create admin:', err.message);
  process.exit(1);
});
