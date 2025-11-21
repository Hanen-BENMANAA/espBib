const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class AcademicYear extends Model {}

AcademicYear.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  label: { type: DataTypes.STRING, allowNull: false } // ex "2023-2024"
}, {
  sequelize,
  modelName: 'AcademicYear',
  tableName: 'academic_years'
});

module.exports = AcademicYear;