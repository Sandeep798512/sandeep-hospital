const express = require('express');
const {
  getAppointments,
  getAppointmentById,
  bookAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', authorize('patient', 'receptionist', 'admin'), bookAppointment);
router.put('/:id/status', updateAppointmentStatus);
router.put('/:id/reschedule', rescheduleAppointment);

module.exports = router;
