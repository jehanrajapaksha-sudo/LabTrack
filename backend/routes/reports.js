const express = require('express');
const { body } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  createReport,
  listReports,
  getReport,
  markReviewed,
  getReportFile
} = require('../controllers/reportController');

const router = express.Router();

router.use(authenticate);

router.get('/', listReports);

router.post(
  '/',
  requireRole('lab'),
  upload.single('file'),
  [
    body('patient_name').trim().notEmpty().withMessage('Patient name is required.'),
    body('patient_id').trim().notEmpty().withMessage('Patient ID is required.'),
    body('report_type').trim().notEmpty().withMessage('Report type is required.'),
    body('report_details').trim().notEmpty().withMessage('Report details are required.')
  ],
  createReport
);

router.get('/:id/file', getReportFile);
router.get('/:id', getReport);
router.patch('/:id/review', requireRole('admin'), markReviewed);

module.exports = router;
