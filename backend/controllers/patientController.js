const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

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
 * @desc    Get all patients (requires admin/doctor/receptionist)
 * @route   GET /api/patients
 * @access  Private (Admin, Doctor, Receptionist)
 */
const getPatients = async (req, res, next) => {
  try {
    const { search, gender, bloodGroup, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    if (gender) {
      query.gender = gender;
    }

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { address: searchRegex },
        { 'emergencyContact.name': searchRegex },
        { 'emergencyContact.phone': searchRegex }
      ];
    }

    // Sort setup
    let sortOptions = { createdAt: -1 }; // Default: Newest first
    if (sort) {
      if (sort === 'name_asc') sortOptions = { name: 1 };
      else if (sort === 'name_desc') sortOptions = { name: -1 };
      else if (sort === 'age_asc') sortOptions = { age: 1 };
      else if (sort === 'age_desc') sortOptions = { age: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const patients = await Patient.find(query)
      .populate('user', 'name email profileImage status')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Patient.countDocuments(query);

    res.status(200).json({
      success: true,
      count: patients.length,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalPatients: totalCount,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single patient details by ID
 * @route   GET /api/patients/:id
 * @access  Private (Admin, Doctor, Receptionist, or Patient Owner)
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'name email profileImage status');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    // Check permissions: patients can only access their own profiles
    if (req.user.role === 'patient') {
      if (!patient.user || patient.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to access this record' });
      }
    }

    res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a patient record (Admin, Receptionist only)
 * @route   POST /api/patients
 * @access  Private (Admin, Receptionist)
 */
const createPatient = async (req, res, next) => {
  try {
    const { name, email, age, gender, bloodGroup, address, emergencyContact, medicalHistory } = req.body;

    // Validate email uniqueness if email provided
    if (email) {
      const patientExists = await Patient.findOne({ email });
      if (patientExists) {
        return res.status(400).json({ success: false, message: 'Patient with this email already exists' });
      }
    }

    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/profiles/${req.file.filename}`;
    }

    const parsedEmergencyContact = typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact;
    const parsedMedicalHistory = typeof medicalHistory === 'string' ? JSON.parse(medicalHistory) : medicalHistory;

    // Create Patient Profile
    const patient = await Patient.create({
      name,
      email,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact: parsedEmergencyContact,
      medicalHistory: parsedMedicalHistory || { allergies: [], chronicConditions: [], pastSurgeries: [] },
      photoUrl,
    });

    await logAuditEvent(req.user._id, req.user.email, 'Create Patient', `Registered Patient: ${name}, Patient ID: ${patient._id}`, req);

    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update patient details (Admin, Receptionist, or Patient Owner)
 * @route   PUT /api/patients/:id
 * @access  Private (Admin, Receptionist, or Patient Owner)
 */
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    // RBAC: Patient can only update their own record
    if (req.user.role === 'patient') {
      if (!patient.user || patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this record' });
      }
    }

    const { name, email, age, gender, bloodGroup, address, emergencyContact, medicalHistory, status } = req.body;

    let photoUrl = patient.photoUrl;
    if (req.file) {
      photoUrl = `/uploads/profiles/${req.file.filename}`;
    }

    const parsedEmergencyContact = typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact;
    const parsedMedicalHistory = typeof medicalHistory === 'string' ? JSON.parse(medicalHistory) : medicalHistory;

    // If User is linked, update User name and profileImage as well
    if (patient.user) {
      const user = await User.findById(patient.user);
      if (user) {
        user.name = name || user.name;
        if (req.file) {
          user.profileImage = photoUrl;
        }
        await user.save();
      }
    }

    // Update patient
    patient.name = name || patient.name;
    patient.email = email || patient.email;
    patient.age = age !== undefined ? age : patient.age;
    patient.gender = gender || patient.gender;
    patient.bloodGroup = bloodGroup || patient.bloodGroup;
    patient.address = address || patient.address;
    patient.emergencyContact = parsedEmergencyContact || patient.emergencyContact;
    patient.medicalHistory = parsedMedicalHistory || patient.medicalHistory;
    patient.photoUrl = photoUrl;
    if (status && req.user.role !== 'patient') {
      patient.status = status;
    }

    await patient.save();

    await logAuditEvent(req.user._id, req.user.email, 'Update Patient', `Updated patient details. Patient ID: ${patient._id}`, req);

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete patient record (Admin only)
 * @route   DELETE /api/patients/:id
 * @access  Private/Admin
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    const patientUserId = patient.user;

    await Patient.findByIdAndDelete(req.params.id);

    // If patient had linked User account, suspend/disable it
    if (patientUserId) {
      await User.findByIdAndUpdate(patientUserId, { status: 'suspended' });
    }

    await logAuditEvent(req.user._id, req.user.email, 'Delete Patient', `Deleted patient record. Patient ID: ${req.params.id}`, req);

    res.status(200).json({
      success: true,
      message: 'Patient record deleted successfully and linked User account suspended',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
