const Doctor = require('../models/Doctor');
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
 * @desc    Get all doctors (supports search, department filter, sorting, pagination)
 * @route   GET /api/doctors
 * @access  Public
 */
const getDoctors = async (req, res, next) => {
  try {
    const { search, department, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search by name (requires joining User)
    let doctorQuery = Doctor.find(query).populate({
      path: 'user',
      select: 'name email profileImage status',
    });

    let doctors = await doctorQuery;

    // Apply manual search filters if search query is provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(
        (doc) =>
          doc.user &&
          (searchRegex.test(doc.user.name) ||
            searchRegex.test(doc.user.email) ||
            doc.specialties.some((spec) => searchRegex.test(spec)))
      );
    }

    // Apply Sorting
    if (sort) {
      if (sort === 'experience_desc') {
        doctors.sort((a, b) => b.experience - a.experience);
      } else if (sort === 'experience_asc') {
        doctors.sort((a, b) => a.experience - b.experience);
      } else if (sort === 'fees_desc') {
        doctors.sort((a, b) => b.fees - a.fees);
      } else if (sort === 'fees_asc') {
        doctors.sort((a, b) => a.fees - b.fees);
      }
    }

    // Total count for pagination
    const totalCount = doctors.length;
    const paginatedDoctors = doctors.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedDoctors.length,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalDoctors: totalCount,
      doctors: paginatedDoctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor details by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', '-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new doctor (Admin only)
 * @route   POST /api/doctors
 * @access  Private/Admin
 */
const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, department, experience, fees, availability, schedule, specialties, bio } = req.body;

    // Check if email already in use
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Image Upload check
    let profileImage = '';
    if (req.file) {
      profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    // Create doctor user
    const user = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      isEmailVerified: true, // Admin created accounts are verified by default
      profileImage,
    });

    // Create doctor record
    const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
    const parsedSchedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
    const parsedSpecialties = typeof specialties === 'string' ? JSON.parse(specialties) : specialties;

    const doctor = await Doctor.create({
      user: user._id,
      department,
      experience,
      fees,
      availability: parsedAvailability || [],
      schedule: parsedSchedule || { start: '09:00', end: '17:00' },
      specialties: parsedSpecialties || [],
      bio,
    });

    await logAuditEvent(req.user._id, req.user.email, 'Create Doctor', `Created Doctor account. Doctor: Dr. ${name}, Dept: ${department}, ID: ${doctor._id}`, req);

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor details (Admin or Self)
 * @route   PUT /api/doctors/:id
 * @access  Private/Admin or Private/Doctor
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Role check: Only admin or the doctor themselves can update
    const user = await User.findById(doctor.user);
    if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const { name, department, experience, fees, availability, schedule, specialties, bio, status } = req.body;

    // Handle user model name & image changes
    if (name) {
      user.name = name;
    }
    if (req.file) {
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    if (status && req.user.role === 'admin') {
      user.status = status;
    }
    await user.save();

    // Update doctor details
    const parsedAvailability = typeof availability === 'string' ? JSON.parse(availability) : availability;
    const parsedSchedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
    const parsedSpecialties = typeof specialties === 'string' ? JSON.parse(specialties) : specialties;

    doctor.department = department || doctor.department;
    doctor.experience = experience !== undefined ? experience : doctor.experience;
    doctor.fees = fees !== undefined ? fees : doctor.fees;
    doctor.availability = parsedAvailability || doctor.availability;
    doctor.schedule = parsedSchedule || doctor.schedule;
    doctor.specialties = parsedSpecialties || doctor.specialties;
    doctor.bio = bio !== undefined ? bio : doctor.bio;

    await doctor.save();

    await logAuditEvent(req.user._id, req.user.email, 'Update Doctor', `Updated Doctor profile for Doctor ID: ${doctor._id}`, req);

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doctor (Admin only)
 * @route   DELETE /api/doctors/:id
 * @access  Private/Admin
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const doctorUserId = doctor.user;

    // Remove doctor record
    await Doctor.findByIdAndDelete(req.params.id);

    // Instead of completely deleting User, suspend/mark user inactive to preserve logs consistency
    await User.findByIdAndUpdate(doctorUserId, { status: 'suspended' });

    await logAuditEvent(req.user._id, req.user.email, 'Delete Doctor', `Deleted Doctor record. Doctor ID: ${req.params.id}, User ID: ${doctorUserId}`, req);

    res.status(200).json({
      success: true,
      message: 'Doctor profile deleted successfully and associated User suspended',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
