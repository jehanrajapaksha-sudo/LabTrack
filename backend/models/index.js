const sequelize = require('../config/database');
const User = require('./User');
const LabReport = require('./LabReport');

User.hasMany(LabReport, {
  foreignKey: 'lab_id',
  as: 'reports',
  onDelete: 'CASCADE'
});

LabReport.belongsTo(User, {
  foreignKey: 'lab_id',
  as: 'lab'
});

module.exports = {
  sequelize,
  User,
  LabReport
};
