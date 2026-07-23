const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const AuditLog = require('../models/AuditLog');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');
const sendEmail = require('../utils/email');

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
 * @desc    Get all prescriptions (role bounded)
 * @route   GET /api/prescriptions
 * @access  Private
 */
const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId, doctorId, page = 1, limit = 10 } = req.query;

    const query = {};

    // Role checks
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(200).json({ success: true, count: 0, prescriptions: [] });
      }
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(200).json({ success: true, count: 0, prescriptions: [] });
      }
      query.doctor = doctor._id;
    } else {
      // Admin / Receptionist filters
      if (patientId) query.patient = patientId;
      if (doctorId) query.doctor = doctorId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name age gender bloodGroup email')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Prescription.countDocuments(query);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalPrescriptions: totalCount,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single prescription by ID
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Role validation
    if (req.user.role === 'patient') {
      if (prescription.patient.user && prescription.patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      if (prescription.doctor.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create prescription (Doctor only)
 * @route   POST /api/prescriptions
 * @access  Private (Doctor)
 */
const createPrescription = async (req, res, next) => {
  try {
    const { patientId, appointmentId, medicines, notes } = req.body;

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only registered doctors can create prescriptions' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const parsedMedicines = typeof medicines === 'string' ? JSON.parse(medicines) : medicines;

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId || null,
      medicines: parsedMedicines,
      notes: notes || '',
    });

    // Notify patient
    if (patient.email) {
      const doctorUser = await User.findById(doctor.user);
      const medsList = parsedMedicines.map((m) => `- ${m.name} (${m.dosage}, ${m.duration})`).join('\n');
      
      await sendEmail({
        to: patient.email,
        subject: 'New Prescription Issued - Sandeep Hospital',
        text: `Hello ${patient.name},\n\nDr. ${doctorUser.name} has issued a new prescription for you on ${new Date().toLocaleDateString()}.\n\nMedicines:\n${medsList}\n\nNotes: ${notes || 'None'}\n\nPlease check your patient portal to view/download details.`,
      });
    }

    await logAuditEvent(req.user._id, req.user.email, 'Create Prescription', `Issued prescription ID: ${prescription._id} to Patient: ${patient.name}`, req);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download prescription PDF
 * @route   GET /api/prescriptions/:id/pdf
 * @access  Private
 */
const downloadPrescriptionPDF = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    const patient = await Patient.findById(prescription.patient);
    const doctor = await Doctor.findById(prescription.doctor).populate('user', 'name');

    // Permission check
    if (req.user.role === 'patient') {
      if (patient.user && patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      if (doctor.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    // Response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Prescription-${prescription._id}.pdf`);

    // Stream PDF
    generatePrescriptionPDF(prescription, patient, doctor, res);

    await logAuditEvent(req.user._id, req.user.email, 'Download Prescription PDF', `Downloaded PDF for prescription: ${prescription._id}`, req);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete prescription (Doctor or Admin only)
 * @route   DELETE /api/prescriptions/:id
 * @access  Private (Admin, Doctor)
 */
const deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Role checks
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || prescription.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this prescription' });
      }
    }

    await Prescription.findByIdAndDelete(req.params.id);

    await logAuditEvent(req.user._id, req.user.email, 'Delete Prescription', `Deleted prescription ID: ${req.params.id}`, req);

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  downloadPrescriptionPDF,
  deletePrescription,
};
