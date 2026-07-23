const express = require('express');
const {
  getReports,
  uploadReport,
  downloadReportFile,
  deleteReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getReports);
router.post('/', authorize('admin', 'doctor', 'receptionist'), upload.single('reportFile'), uploadReport);
router.get('/:id/download', downloadReportFile);
router.delete('/:id', authorize('admin', 'doctor'), deleteReport);

module.exports = router;
