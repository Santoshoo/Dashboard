const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DutyAssignment = sequelize.define('DutyAssignment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING, // 'IT DATA CENTER' or 'IT COMMAND CENTER'
    allowNull: false,
    defaultValue: 'IT DATA CENTER',
  },
  dutyDate: {
    type: DataTypes.DATEONLY, // YYYY-MM-DD
    allowNull: false,
  },
  assignedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['dutyDate', 'location'] // One duty person per location per day
    }
  ]
});

module.exports = DutyAssignment;
