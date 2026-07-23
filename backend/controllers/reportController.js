const Report = require('../models/Report');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const path = require('path');
const fs = require('fs');

// Helper to log audit events
const logAuditEvent = async (userId, email, action, details, req) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    await AuditLog.create({
      user: userId || null,
      userEmail: email || 'System',
      action,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('Audit Logging Failed:', err.message);
  }
};

/**
 * @desc    Get all medical reports (role based filters)
 * @route   GET /api/reports
 * @access  Private
 */
const getReports = async (req, res, next) => {
  try {
    const { patientId, reportType, page = 1, limit = 10 } = req.query;

    const query = {};

    // Role checks
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(200).json({ success: true, count: 0, reports: [] });
      }
      query.patient = patient._id;
    } else {
      if (patientId) query.patient = patientId;
    }

    if (reportType) {
      query.reportType = reportType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
      .populate('patient', 'name age gender bloodGroup email')
      .populate('uploadedBy', 'name role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalReports: totalCount,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload report file & save report metadata (Admin, Doctor, Receptionist only)
 * @route   POST /api/reports
 * @access  Private (Admin, Doctor, Receptionist)
 */
const uploadReport = async (req, res, next) => {
  try {
    const { patientId, title, reportType } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const fileUrl = `/uploads/reports/${req.file.filename}`;

    const report = await Report.create({
      patient: patientId,
      title,
      reportType,
      fileUrl,
      uploadedBy: req.user.id,
      date: new Date(),
    });

    await logAuditEvent(req.user._id, req.user.email, 'Upload Report', `Uploaded ${reportType} report titled: '${title}' for Patient: ${patient.name}`, req);

    res.status(201).json({
      success: true,
      message: 'Medical report uploaded successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download or Stream uploaded report file securely (checks role authorization)
 * @route   GET /api/reports/:id/download
 * @access  Private
 */
const downloadReportFile = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const patient = await Patient.findById(report.patient);

    // Permission check
    if (req.user.role === 'patient') {
      if (patient.user && patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to download this report' });
      }
    }

    const filePath = path.join(__dirname, '..', report.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Report file does not exist on disk' });
    }

    res.download(filePath, `${report.title}${path.extname(filePath)}`);

    await logAuditEvent(req.user._id, req.user.email, 'Download Report File', `Downloaded medical report: ${report._id}`, req);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete report metadata & file (Admin, Doctor only)
 * @route   DELETE /api/reports/:id
 * @access  Private (Admin, Doctor)
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const filePath = path.join(__dirname, '..', report.fileUrl);

    // Remove file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove record from database
    await Report.findByIdAndDelete(req.params.id);

    await logAuditEvent(req.user._id, req.user.email, 'Delete Report', `Deleted medical report record: ${report.title} (${report._id})`, req);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  uploadReport,
  downloadReportFile,
  deleteReport,
};
