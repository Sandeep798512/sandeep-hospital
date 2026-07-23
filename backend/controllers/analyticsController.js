const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const AuditLog = require('../models/AuditLog');
const Prescription = require('../models/Prescription');

/**
 * @desc    Get dashboard metrics & visual stats for Admin and Receptionist
 * @route   GET /api/analytics/dashboard-stats
 * @access  Private (Admin, Receptionist)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();

    // Today's appointments count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday },
    });

    const pendingAppointments = await Appointment.countDocuments({
      status: 'Pending',
    });

    // Total revenue from paid bills
    const paidBills = await Bill.find({ paymentStatus: 'Paid' });
    const totalRevenue = paidBills.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Recent system activities (audit logs)
    const recentActivities = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(8);

    // Monthly revenue breakdown (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const billsInMonth = await Bill.find({
        paymentStatus: 'Paid',
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });
      const revenue = billsInMonth.reduce((acc, curr) => acc + curr.totalAmount, 0);

      monthlyRevenue.push({
        month: date.toLocaleString('default', { month: 'short' }),
        revenue,
      });
    }

    // Doctor distribution per department (for charts)
    const departmentsList = [
      'Cardiology', 'Neurology', 'Orthopedics', 'Dentist',
      'ENT', 'General Physician', 'Pediatrics', 'Dermatology', 'Gynecology', 'Emergency'
    ];

    const departmentStats = [];
    for (const dept of departmentsList) {
      const count = await Doctor.countDocuments({ department: dept });
      departmentStats.push({ department: dept, count });
    }

    // Appointment growth stats (last 6 months)
    const monthlyAppointments = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const count = await Appointment.countDocuments({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      monthlyAppointments.push({
        month: date.toLocaleString('default', { month: 'short' }),
        appointments: count,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        pendingAppointments,
        totalRevenue,
      },
      recentActivities,
      monthlyRevenue,
      departmentStats,
      monthlyAppointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get metrics for a specific Doctor
 * @route   GET /api/analytics/doctor-stats
 * @access  Private (Doctor)
 */
const getDoctorStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Today's appointments count
    const todayAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'Cancelled' },
    });

    // Total appointments booked
    const totalAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
    });

    // Pending review appointments
    const pendingReview = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'Pending',
    });

    // Total prescription count issued
    const totalPrescriptions = await Prescription.countDocuments({
      doctor: doctor._id,
    });

    res.status(200).json({
      success: true,
      stats: {
        todayAppointments,
        totalAppointments,
        pendingReview,
        totalPrescriptions,
        fees: doctor.fees,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get metrics for a Patient dashboard
 * @route   GET /api/analytics/patient-stats
 * @access  Private (Patient)
 */
const getPatientStats = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const totalAppointments = await Appointment.countDocuments({ patient: patient._id });
    const activePrescriptions = await Prescription.countDocuments({ patient: patient._id });
    const unpaidBills = await Bill.countDocuments({ patient: patient._id, paymentStatus: 'Pending' });

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        activePrescriptions,
        unpaidBills,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDoctorStats,
  getPatientStats,
};
