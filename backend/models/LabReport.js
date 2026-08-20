const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LabReport = sequelize.define(
  'LabReport',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    lab_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    patient_name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    patient_id: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    report_type: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    report_details: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    tableName: 'lab_reports',
    createdAt: 'submitted_at',
    updatedAt: false
  }
);

module.exports = LabReport;
