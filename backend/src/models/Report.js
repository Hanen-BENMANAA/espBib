const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

class Report extends Model {}

Report.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(500), allowNull: false },
  authorFirstName: { type: DataTypes.STRING },
  authorLastName: { type: DataTypes.STRING },
  studentNumber: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  specialty: { type: DataTypes.STRING },
  academicYear: { type: DataTypes.STRING },
  supervisor: { type: DataTypes.STRING },
  coSupervisor: { type: DataTypes.STRING },
  hostCompany: { type: DataTypes.STRING },
  defenseDate: { type: DataTypes.DATEONLY },
  keywords: { type: DataTypes.ARRAY(DataTypes.STRING) },
  abstract: { type: DataTypes.TEXT },
  allowPublicAccess: { type: DataTypes.BOOLEAN, defaultValue: true },
  isConfidential: { type: DataTypes.BOOLEAN, defaultValue: false },
  fileName: { type: DataTypes.STRING },
  filePath: { type: DataTypes.STRING },
  fileSize: { type: DataTypes.BIGINT },
  fileUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  validationStatus: { type: DataTypes.STRING },
  teacherComments: { type: DataTypes.TEXT },
  validatedBy: { type: DataTypes.INTEGER },
  validatedAt: { type: DataTypes.DATE },
  checklist: { type: DataTypes.JSONB },
  submissionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  lastModified: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  version: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  sequelize,
  modelName: 'Report',
  tableName: 'reports'
});

// Association
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Report;