const AuditLog = require('../models/AuditLog');

/**
 * @desc    Get system audit logs (Admin only)
 * @route   GET /api/audit-logs
 * @access  Private (Admin)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (action) {
      query.action = action;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { userEmail: searchRegex },
        { action: searchRegex },
        { details: searchRegex },
        { ipAddress: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
      .populate('user', 'name role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalLogs: totalCount,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
