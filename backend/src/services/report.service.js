const Report = require('../models/Report');

async function createReport(data) {
  // data should contain userId + report fields
  const report = await Report.create(data);
  return report;
}

async function getReportsByUser(userId) {
  return await Report.findAll({ where: { userId }, order: [['submissionDate', 'DESC']] });
}

async function getReportById(id) {
  return await Report.findByPk(id);
}

module.exports = { createReport, getReportsByUser, getReportById };