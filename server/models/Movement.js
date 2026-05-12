const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Movement = sequelize.define('Movement', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  employeeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  outTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  returnTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  informTo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  visitLocation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Movement;
