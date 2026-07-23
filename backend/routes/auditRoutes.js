const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Restrict all logs access to admin role only

router.get('/', getAuditLogs);

module.exports = router;
