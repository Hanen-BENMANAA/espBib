const reportService = require('../services/report.service');

async function submit(req, res, next) {
  try {
    // expects body fields and optionally file handling done in route
    const payload = {
      userId: req.user.id,
      title: req.body.title,
      authorFirstName: req.body.authorFirstName,
      authorLastName: req.body.authorLastName,
      studentNumber: req.body.studentNumber,
      email: req.body.email,
      specialty: req.body.specialty,
      academicYear: req.body.academicYear,
      supervisor: req.body.supervisor,
      coSupervisor: req.body.coSupervisor,
      defenseDate: req.body.defenseDate,
      keywords: req.body.keywords ? JSON.parse(req.body.keywords) : [],
      abstract: req.body.abstract,
      fileName: req.file ? req.file.originalname : null,
      filePath: req.file ? req.file.path : null,
      fileSize: req.file ? req.file.size : null,
      fileUrl: req.file ? (`/uploads/${req.file.filename}`) : null,
      status: 'pending',
      checklist: req.body.checklist ? JSON.parse(req.body.checklist) : {}
    };
    const report = await reportService.createReport(payload);
    res.status(201).json({ success: true, report });
  } catch (err) {
    next(err);
  }
}

async function mySubmissions(req, res, next) {
  try {
    const reports = await reportService.getReportsByUser(req.user.id);
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, mySubmissions, getById };