const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Single Sequelize instance used by every model.
 * Credentials come from backend/.env so they are not hardcoded.
 */
const useSsl = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {},
    define: {
      underscored: true,
      timestamps: true
    }
  }
);

module.exports = sequelize;
