const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
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
 * @desc    Get all appointments (filtered based on RBAC roles)
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId, status, date, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    // Role specific query constraints
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(200).json({ success: true, count: 0, appointments: [] });
      }
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(200).json({ success: true, count: 0, appointments: [] });
      }
      query.doctor = doctor._id;
    } else {
      // Admins & Receptionists can filter by doctorId or patientId query params
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort setup
    let sortOptions = { date: 1, timeSlot: 1 }; // Default: Chronological order
    if (sort === 'newest') sortOptions = { createdAt: -1 };
    else if (sort === 'oldest') sortOptions = { createdAt: 1 };

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patient',
        select: 'name age gender bloodGroup phone email',
      })
      .populate({
        path: 'doctor',
        select: 'department fees availability schedule',
        populate: {
          path: 'user',
          select: 'name profileImage',
        },
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalAppointments: totalCount,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email profileImage' },
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role validation
    if (req.user.role === 'patient') {
      if (appointment.patient.user && appointment.patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient, Receptionist, Admin)
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, patientId, date, timeSlot, reason, notes } = req.body;

    let targetPatientId = patientId;

    // If booked by patient, find their patient record
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(400).json({ success: false, message: 'Patient profile not found. Please complete profile details first.' });
      }
      targetPatientId = patient._id;
    } else {
      // Admins and Receptionists must supply a patientId
      if (!targetPatientId) {
        return res.status(400).json({ success: false, message: 'Please provide patient ID' });
      }
    }

    // Check doctor availability
    const doctor = await Doctor.findById(doctorId).populate('user', 'name email');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if slot already taken
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['Pending', 'Approved', 'Rescheduled'] },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Time slot already booked for this doctor. Please choose another slot.' });
    }

    const appointment = await Appointment.create({
      patient: targetPatientId,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      reason,
      notes,
      status: 'Pending', // Requires approval
    });

    const patientRecord = await Patient.findById(targetPatientId);

    // Email notification details
    await sendEmail({
      to: doctor.user.email,
      subject: 'New Appointment Request - Sandeep Hospital',
      text: `Hello Dr. ${doctor.user.name}, you have a new appointment booking request from patient ${patientRecord.name} for ${new Date(date).toLocaleDateString()} at ${timeSlot}. Reason: ${reason}.`,
    });

    if (patientRecord.email) {
      await sendEmail({
        to: patientRecord.email,
        subject: 'Appointment Booked (Pending Approval) - Sandeep Hospital',
        text: `Hello ${patientRecord.name}, your appointment with Dr. ${doctor.user.name} has been successfully requested for ${new Date(date).toLocaleDateString()} at ${timeSlot}. Status: Pending Approval.`,
      });
    }

    await logAuditEvent(req.user._id, req.user.email, 'Book Appointment', `Booked appointment ID: ${appointment._id} for doctor ID: ${doctorId}`, req);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully and is pending approval',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve, Reject, or Cancel appointment
 * @route   PUT /api/appointments/:id/status
 * @access  Private
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Approved', 'Rejected', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role validation
    if (req.user.role === 'patient') {
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
      }
      if (appointment.patient.user && appointment.patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
      }
    }

    // Update status
    appointment.status = status;
    await appointment.save();

    // Send status notification emails
    if (appointment.patient.email) {
      await sendEmail({
        to: appointment.patient.email,
        subject: `Appointment Status Update: ${status} - Sandeep Hospital`,
        text: `Dear ${appointment.patient.name}, your appointment with Dr. ${appointment.doctor.user.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} has been ${status.toLowerCase()}.`,
      });
    }

    await logAuditEvent(req.user._id, req.user.email, 'Update Appointment Status', `Changed appointment ID: ${appointment._id} status to ${status}`, req);

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reschedule appointment
 * @route   PUT /api/appointments/:id/reschedule
 * @access  Private
 */
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role checks
    if (req.user.role === 'patient') {
      if (appointment.patient.user && appointment.patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      if (appointment.doctor.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    // Check slot availability
    const existing = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor._id,
      date: new Date(date),
      timeSlot,
      status: { $in: ['Pending', 'Approved', 'Rescheduled'] },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Target time slot already booked. Please choose another.' });
    }

    // Record rescheduling history
    appointment.rescheduledHistory.push({
      previousDate: appointment.date,
      previousTimeSlot: appointment.timeSlot,
      rescheduledBy: req.user.id,
      dateChangedAt: new Date(),
    });

    // Update appointment
    appointment.date = new Date(date);
    appointment.timeSlot = timeSlot;
    appointment.status = 'Rescheduled'; // Flags status back to rescheduled (needs review/approval)
    await appointment.save();

    // Trigger emails
    if (appointment.patient.email) {
      await sendEmail({
        to: appointment.patient.email,
        subject: 'Appointment Rescheduled - Sandeep Hospital',
        text: `Dear ${appointment.patient.name}, your appointment with Dr. ${appointment.doctor.user.name} has been rescheduled to ${new Date(date).toLocaleDateString()} at ${timeSlot}. Verification Pending.`,
      });
    }

    await sendEmail({
      to: appointment.doctor.user.email,
      subject: 'Appointment Rescheduled Request - Sandeep Hospital',
      text: `Hello Dr. ${appointment.doctor.user.name}, the appointment with patient ${appointment.patient.name} has been rescheduled to ${new Date(date).toLocaleDateString()} at ${timeSlot}. Check portal to approve.`,
    });

    await logAuditEvent(req.user._id, req.user.email, 'Reschedule Appointment', `Rescheduled appointment ID: ${appointment._id} to ${date} ${timeSlot}`, req);

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully and pending approval',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  bookAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
};
