const express = require('express');
const {
  getBills,
  getBillById,
  createBill,
  updateBill,
  downloadInvoicePDF,
  deleteBill,
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect); // All billing routes require authentication

router.get('/', getBills);
router.get('/:id', getBillById);
router.post('/', authorize('admin', 'receptionist'), createBill);
router.put('/:id', authorize('admin', 'receptionist'), updateBill);
router.get('/:id/pdf', downloadInvoicePDF);
router.delete('/:id', authorize('admin'), deleteBill);

module.exports = router;
