const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

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
 * @desc    Get all bills (filtered based on roles)
 * @route   GET /api/bills
 * @access  Private
 */
const getBills = async (req, res, next) => {
  try {
    const { patientId, paymentStatus, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Role constraints
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(200).json({ success: true, count: 0, bills: [] });
      }
      query.patient = patient._id;
    } else {
      // Admins & Receptionists can filter by patientId
      if (patientId) query.patient = patientId;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      // For searching invoice number or joining patients name
      query.$or = [{ invoiceNumber: searchRegex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let billsQuery = Bill.find(query)
      .populate('patient', 'name age gender bloodGroup email')
      .populate({
        path: 'appointment',
        populate: { path: 'doctor', populate: { path: 'user', select: 'name' } }
      })
      .sort({ createdAt: -1 });

    let bills = await billsQuery;

    // Filter by patient name manually if search matched name and wasn't filtered in query
    if (search && req.user.role !== 'patient') {
      const searchRegex = new RegExp(search, 'i');
      bills = bills.filter(
        (bill) =>
          searchRegex.test(bill.invoiceNumber) ||
          (bill.patient && searchRegex.test(bill.patient.name))
      );
    }

    const totalCount = bills.length;
    const paginatedBills = bills.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedBills.length,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalBills: totalCount,
      bills: paginatedBills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bill details by ID
 * @route   GET /api/bills/:id
 * @access  Private
 */
const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'appointment',
        populate: { path: 'doctor', populate: { path: 'user', select: 'name' } }
      });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Role check
    if (req.user.role === 'patient') {
      if (bill.patient.user && bill.patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this bill' });
      }
    }

    res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new bill (Admin/Receptionist only)
 * @route   POST /api/bills
 * @access  Private (Admin, Receptionist)
 */
const createBill = async (req, res, next) => {
  try {
    const { patientId, appointmentId, consultationCharges, medicineCharges, roomCharges, labCharges, discount, gst, paymentStatus, paymentMethod, transactionId } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Calculations
    const cc = parseFloat(consultationCharges || 0);
    const mc = parseFloat(medicineCharges || 0);
    const rc = parseFloat(roomCharges || 0);
    const lc = parseFloat(labCharges || 0);
    const disc = parseFloat(discount || 0);
    const gstRate = parseFloat(gst !== undefined ? gst : 18);

    const subtotal = cc + mc + rc + lc;
    const taxableAmount = Math.max(0, subtotal - disc);
    const gstAmount = taxableAmount * (gstRate / 100);
    const totalAmount = taxableAmount + gstAmount;

    // Generate Unique Invoice Number (INV-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${rand}`;

    const bill = await Bill.create({
      patient: patientId,
      appointment: appointmentId || null,
      consultationCharges: cc,
      medicineCharges: mc,
      roomCharges: rc,
      labCharges: lc,
      discount: disc,
      gst: gstRate,
      totalAmount,
      paymentStatus: paymentStatus || 'Pending',
      paymentMethod: paymentMethod || 'None',
      transactionId: transactionId || '',
      invoiceNumber,
    });

    await logAuditEvent(req.user._id, req.user.email, 'Create Bill', `Created bill invoice: ${invoiceNumber} for Patient: ${patient.name}. Total: INR ${totalAmount}`, req);

    res.status(201).json({
      success: true,
      message: 'Bill invoice created successfully',
      bill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update bill details/payment status (Admin/Receptionist only)
 * @route   PUT /api/bills/:id
 * @access  Private (Admin, Receptionist)
 */
const updateBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const { paymentStatus, paymentMethod, transactionId, consultationCharges, medicineCharges, roomCharges, labCharges, discount, gst } = req.body;

    // Re-calculate if charges are updated
    let totalAmount = bill.totalAmount;
    const cc = consultationCharges !== undefined ? parseFloat(consultationCharges) : bill.consultationCharges;
    const mc = medicineCharges !== undefined ? parseFloat(medicineCharges) : bill.medicineCharges;
    const rc = roomCharges !== undefined ? parseFloat(roomCharges) : bill.roomCharges;
    const lc = labCharges !== undefined ? parseFloat(labCharges) : bill.labCharges;
    const disc = discount !== undefined ? parseFloat(discount) : bill.discount;
    const gstRate = gst !== undefined ? parseFloat(gst) : bill.gst;

    if (
      consultationCharges !== undefined ||
      medicineCharges !== undefined ||
      roomCharges !== undefined ||
      labCharges !== undefined ||
      discount !== undefined ||
      gst !== undefined
    ) {
      const subtotal = cc + mc + rc + lc;
      const taxableAmount = Math.max(0, subtotal - disc);
      const gstAmount = taxableAmount * (gstRate / 100);
      totalAmount = taxableAmount + gstAmount;
    }

    bill.consultationCharges = cc;
    bill.medicineCharges = mc;
    bill.roomCharges = rc;
    bill.labCharges = lc;
    bill.discount = disc;
    bill.gst = gstRate;
    bill.totalAmount = totalAmount;

    bill.paymentStatus = paymentStatus || bill.paymentStatus;
    bill.paymentMethod = paymentMethod || bill.paymentMethod;
    bill.transactionId = transactionId !== undefined ? transactionId : bill.transactionId;

    await bill.save();

    await logAuditEvent(req.user._id, req.user.email, 'Update Bill', `Updated bill ID: ${bill._id}, payment status: ${bill.paymentStatus}`, req);

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      bill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download invoice PDF
 * @route   GET /api/bills/:id/pdf
 * @access  Private
 */
const downloadInvoicePDF = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const patient = await Patient.findById(bill.patient);

    // Permission validations
    if (req.user.role === 'patient') {
      if (patient.user && patient.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    // Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${bill.invoiceNumber}.pdf`);

    // Stream PDF directly to Response
    generateInvoicePDF(bill, patient, res);

    await logAuditEvent(req.user._id, req.user.email, 'Download Invoice PDF', `Downloaded PDF for invoice: ${bill.invoiceNumber}`, req);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete bill invoice (Admin only)
 * @route   DELETE /api/bills/:id
 * @access  Private/Admin
 */
const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    await Bill.findByIdAndDelete(req.params.id);

    await logAuditEvent(req.user._id, req.user.email, 'Delete Bill', `Deleted bill invoice: ${bill.invoiceNumber}`, req);

    res.status(200).json({
      success: true,
      message: 'Bill invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBills,
  getBillById,
  createBill,
  updateBill,
  downloadInvoicePDF,
  deleteBill,
};
