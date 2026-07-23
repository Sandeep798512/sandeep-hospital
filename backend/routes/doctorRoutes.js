const express = require('express');
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Protected routes
router.post('/', protect, authorize('admin'), upload.single('profileImage'), createDoctor);
router.put('/:id', protect, upload.single('profileImage'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

module.exports = router;
