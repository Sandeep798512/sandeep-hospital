const express = require('express');
const {
  getDashboardStats,
  getDoctorStats,
  getPatientStats,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/dashboard-stats', authorize('admin', 'receptionist'), getDashboardStats);
router.get('/doctor-stats', authorize('doctor'), getDoctorStats);
router.get('/patient-stats', authorize('patient'), getPatientStats);

module.exports = router;
