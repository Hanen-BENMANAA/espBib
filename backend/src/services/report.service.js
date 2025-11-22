// backend/reports/report.service.js

const db = require('../db');

// Create a new report
async function createReport(data) {
  const {
    user_id,
    title,
    author_first_name,
    author_last_name,
    student_number,
    email,
    specialty,
    academic_year,
    supervisor,
    co_supervisor,
    host_company,
    defense_date,
    keywords,
    abstract,
    allow_public_access,
    is_confidential,
    file_name,
    file_path,
    file_size,
    file_url,
    status,
    checklist
  } = data;

  const result = await db.query(
    `INSERT INTO reports (
      user_id, title, author_first_name, author_last_name, student_number, email,
      specialty, academic_year, supervisor, co_supervisor, host_company, defense_date,
      keywords, abstract,
      allow_public_access, is_confidential,
      file_name, file_path, file_size, file_url,
      status, checklist, submission_date, last_modified
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,$12,
      $13,$14,
      $15,$16,
      $17,$18,$19,$20,
      $21,$22, NOW(), NOW()
    ) RETURNING *`,
    [
      user_id,
      title,
      author_first_name,
      author_last_name,
      student_number,
      email,
      specialty,
      academic_year,
      supervisor,
      co_supervisor,
      host_company,
      defense_date,
      keywords,
      abstract,
      allow_public_access,
      is_confidential,
      file_name,
      file_path,
      file_size,
      file_url,
      status || "pending",
      checklist || {}
    ]
  );

  return result.rows[0];
}

// Get all reports from a user
async function getReportsByUser(userId) {
  const result = await db.query(
    `SELECT * FROM reports
     WHERE user_id = $1
     ORDER BY submission_date DESC`,
    [userId]
  );
  return result.rows;
}

// Get report by ID
async function getReportById(id) {
  const result = await db.query(
    `SELECT * FROM reports WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createReport,
  getReportsByUser,
  getReportById
};
