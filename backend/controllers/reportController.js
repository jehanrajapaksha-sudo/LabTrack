const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { LabReport, User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const { uploadDir } = require('../middleware/upload');

function formatReport(report) {
  const json = report.toJSON();
  return {
    id: json.id,
    lab_id: json.lab_id,
    lab_name: json.lab ? json.lab.name : undefined,
    lab_email: json.lab ? json.lab.email : undefined,
    patient_name: json.patient_name,
    patient_id: json.patient_id,
    report_type: json.report_type,
    report_details: json.report_details,
    file_path: json.file_path,
    has_file: Boolean(json.file_path),
    status: json.status,
    submitted_at: json.submitted_at
  };
}

function canAccessReport(user, report) {
  return user.role === 'admin' || report.lab_id === user.id;
}

/**
 * Lab submits a new report. Optional PDF/image is stored under /uploads.
 */
const createReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(400).json({ message: 'Validation failed.', errors: errors.array() });
  }

  const { patient_name, patient_id, report_type, report_details } = req.body;

  const report = await LabReport.create({
    lab_id: req.user.id,
    patient_name: patient_name.trim(),
    patient_id: patient_id.trim(),
    report_type: report_type.trim(),
    report_details: report_details.trim(),
    file_path: req.file ? req.file.filename : null,
    status: 'pending'
  });

  const created = await LabReport.findByPk(report.id, {
    include: [{ model: User, as: 'lab', attributes: ['id', 'name', 'email'] }]
  });

  res.status(201).json({ report: formatReport(created) });
});

/**
 * Labs see only their own reports. Admins see all, with optional filters.
 */
const listReports = asyncHandler(async (req, res) => {
  const { labName, status, date } = req.query;
  const where = {};
  const include = [
    { model: User, as: 'lab', attributes: ['id', 'name', 'email'] }
  ];

  if (req.user.role === 'lab') {
    where.lab_id = req.user.id;
  }

  if (status) {
    if (!['pending', 'reviewed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be pending or reviewed.' });
    }
    where.status = status;
  }

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Date must be YYYY-MM-DD.' });
    }
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    where.submitted_at = { [Op.between]: [start, end] };
  }

  if (req.user.role === 'admin' && labName && labName.trim()) {
    include[0].where = {
      name: { [Op.like]: `%${labName.trim()}%` }
    };
  }

  const reports = await LabReport.findAll({
    where,
    include,
    order: [['submitted_at', 'DESC']]
  });

  res.json({ reports: reports.map(formatReport) });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await LabReport.findByPk(req.params.id, {
    include: [{ model: User, as: 'lab', attributes: ['id', 'name', 'email'] }]
  });

  if (!report) {
    return res.status(404).json({ message: 'Report not found.' });
  }

  if (!canAccessReport(req.user, report)) {
    return res.status(403).json({ message: 'You do not have permission to view this report.' });
  }

  res.json({ report: formatReport(report) });
});

const markReviewed = asyncHandler(async (req, res) => {
  const report = await LabReport.findByPk(req.params.id, {
    include: [{ model: User, as: 'lab', attributes: ['id', 'name', 'email'] }]
  });

  if (!report) {
    return res.status(404).json({ message: 'Report not found.' });
  }

  report.status = 'reviewed';
  await report.save();

  res.json({ report: formatReport(report) });
});

const getReportFile = asyncHandler(async (req, res) => {
  const report = await LabReport.findByPk(req.params.id);

  if (!report) {
    return res.status(404).json({ message: 'Report not found.' });
  }

  if (!canAccessReport(req.user, report)) {
    return res.status(403).json({ message: 'You do not have permission to access this file.' });
  }

  if (!report.file_path) {
    return res.status(404).json({ message: 'This report has no attached file.' });
  }

  const filePath = path.join(uploadDir, report.file_path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File is missing on the server.' });
  }

  const download = req.query.download === 'true';
  res.setHeader(
    'Content-Disposition',
    `${download ? 'attachment' : 'inline'}; filename="${report.file_path}"`
  );
  res.sendFile(filePath);
});

module.exports = {
  createReport,
  listReports,
  getReport,
  markReviewed,
  getReportFile
};
