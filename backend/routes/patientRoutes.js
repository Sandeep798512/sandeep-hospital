const express = require('express');
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // All patient routes require authentication

router.get('/', authorize('admin', 'doctor', 'receptionist'), getPatients);
router.get('/:id', getPatientById);
router.post('/', authorize('admin', 'receptionist'), upload.single('photo'), createPatient);
router.put('/:id', upload.single('photo'), updatePatient); // Self, receptionist or admin checks are handled inside controller
router.delete('/:id', authorize('admin'), deletePatient);

module.exports = router;
