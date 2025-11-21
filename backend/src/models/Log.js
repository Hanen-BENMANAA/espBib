const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Log extends Model {}

Log.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING },
  meta: { type: DataTypes.JSONB },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'Log',
  tableName: 'logs',
  updatedAt: false
});

module.exports = Log;