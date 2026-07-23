const express = require('express');
const {
  chatbotAssistant,
  symptomChecker,
  predictDisease,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All AI assistant routes require authentication

router.post('/chat', chatbotAssistant);
router.post('/symptom-checker', symptomChecker);
router.post('/predict-disease', predictDisease);

module.exports = router;
