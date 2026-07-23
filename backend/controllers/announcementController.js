const Announcement = require('../models/Announcement');
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
 * @desc    Get active announcements based on current user role
 * @route   GET /api/announcements
 * @access  Private
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const query = { active: true };

    // Filter by role (if not admin, check targetRoles)
    if (req.user.role !== 'admin') {
      query.$or = [
        { targetRoles: { $size: 0 } }, // Targets all roles
        { targetRoles: req.user.role } // Targets specific user role
      ];
    } else {
      // Admin sees everything, inactive announcements too if query filter active is not specified
      if (req.query.all === 'true') {
        delete query.active;
      }
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new announcement (Admin only)
 * @route   POST /api/announcements
 * @access  Private (Admin)
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetRoles } = req.body;

    const parsedRoles = typeof targetRoles === 'string' ? JSON.parse(targetRoles) : targetRoles;

    const announcement = await Announcement.create({
      title,
      content,
      targetRoles: parsedRoles || [],
      createdBy: req.user.id,
    });

    await logAuditEvent(req.user._id, req.user.email, 'Create Announcement', `Created announcement titled: '${title}' for roles: [${targetRoles || 'all'}]`, req);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update announcement (Admin only)
 * @route   PUT /api/announcements/:id
 * @access  Private (Admin)
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const { title, content, targetRoles, active } = req.body;

    const parsedRoles = typeof targetRoles === 'string' ? JSON.parse(targetRoles) : targetRoles;

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.targetRoles = parsedRoles || announcement.targetRoles;
    if (active !== undefined) {
      announcement.active = active;
    }

    await announcement.save();

    await logAuditEvent(req.user._id, req.user.email, 'Update Announcement', `Updated announcement ID: ${announcement._id}`, req);

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete announcement (Admin only)
 * @route   DELETE /api/announcements/:id
 * @access  Private (Admin)
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    await logAuditEvent(req.user._id, req.user.email, 'Delete Announcement', `Deleted announcement titled: '${announcement.title}'`, req);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
