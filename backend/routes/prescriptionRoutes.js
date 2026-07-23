const express = require('express');
const {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  downloadPrescriptionPDF,
  deletePrescription,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/', authorize('doctor'), createPrescription);
router.get('/:id/pdf', downloadPrescriptionPDF);
router.delete('/:id', authorize('doctor', 'admin'), deletePrescription);

module.exports = router;
