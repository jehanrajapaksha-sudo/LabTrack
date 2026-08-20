require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use(errorHandler);

async function ensureAdmin() {
  const existingAdmin = await User.findOne({ where: { role: 'admin' } });
  if (existingAdmin) {
    return;
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@labreport.local').toLowerCase().trim();
  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);
  await User.create({
    name: process.env.ADMIN_NAME || 'System Admin',
    email,
    password: hashed,
    role: 'admin'
  });
  console.log(`Admin account created: ${email}`);
}

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await ensureAdmin();
    app.listen(PORT, () => {
      console.log(`Lab Report System running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server. Check MySQL credentials in backend/.env');
    console.error(err.message);
    process.exit(1);
  }
}

start();
