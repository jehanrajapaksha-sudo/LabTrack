const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * labs and admins share this table; role decides dashboard access.
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('lab', 'admin'),
      allowNull: false,
      defaultValue: 'lab'
    }
  },
  {
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = User;
