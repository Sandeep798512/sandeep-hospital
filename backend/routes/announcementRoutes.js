const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAnnouncements);
router.post('/', authorize('admin'), createAnnouncement);
router.put('/:id', authorize('admin'), updateAnnouncement);
router.delete('/:id', authorize('admin'), deleteAnnouncement);

module.exports = router;
