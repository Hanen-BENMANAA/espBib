// backend/reports/report.controller.js

const reportService = require('../reports/report.service');

async function submit(req, res, next) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const {
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
      checklist
    } = req.body;

    const report = await reportService.createReport({
      user_id: userId,
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
      keywords: keywords ? keywords.split(",") : [],
      abstract,
      allow_public_access: allow_public_access === "true",
      is_confidential: is_confidential === "true",
      file_name: req.file.originalname,
      file_path: `/uploads/${req.file.filename}`,
      file_size: req.file.size,
      file_url: `/uploads/${req.file.filename}`,
      checklist: checklist ? JSON.parse(checklist) : {}
    });

    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    next(err);
  }
}

async function mySubmissions(req, res, next) {
  try {
    const userId = req.user.id;
    const reports = await reportService.getReportsByUser(userId);
    res.json(reports);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const report = await reportService.getReportById(req.params.id);

    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json(report);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submit,
  mySubmissions,
  getById
};
