const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const isGeminiAvailable = Boolean(geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here');

let genAI;
if (isGeminiAvailable) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
}

// Supported Gemini model candidates in order of preference
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-pro'
];

/**
 * Helper to call Gemini model with dynamic model candidate fallback
 */
const generateWithModelFallback = async (promptOrHistory, isChat = false, chatMessage = '') => {
  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      if (isChat) {
        const chat = model.startChat({
          history: promptOrHistory,
        });
        const result = await chat.sendMessage(chatMessage);
        const response = await result.response;
        return response.text();
      } else {
        const result = await model.generateContent(promptOrHistory);
        const response = await result.response;
        return response.text();
      }
    } catch (err) {
      console.warn(`[Gemini Model Fallback] Model '${modelName}' failed: ${err.message}. Retrying next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model candidates failed');
};

/**
 * @desc    Chatbot assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chatbotAssistant = async (req, res, next) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    if (!isGeminiAvailable) {
      const lowerMsg = message.toLowerCase();
      let responseText = "I am the Sandeep Hospital AI Assistant. I'm currently running in mock evaluation mode because the Gemini API key is not configured. How can I help you today?";

      if (lowerMsg.includes('appointment')) {
        responseText = "To book an appointment, please navigate to the 'Book Appointment' section in your portal. You can select your preferred doctor, date, and time slot. Our reception team will review and approve it shortly.";
      } else if (lowerMsg.includes('bill') || lowerMsg.includes('payment')) {
        responseText = "You can view your bills and invoices in the 'Billing' section. Paid bills will show as completed, and you can download their PDF receipts directly.";
      } else if (lowerMsg.includes('report') || lowerMsg.includes('mri') || lowerMsg.includes('x-ray')) {
        responseText = "Your medical reports are stored securely. You can find them under the 'Medical Records' section in your dashboard to view or download them.";
      } else if (lowerMsg.includes('headache') || lowerMsg.includes('fever') || lowerMsg.includes('pain')) {
        responseText = "A mild headache or fever can be caused by dehydration, fatigue, or minor infections. Please rest, stay hydrated, and consult a General Physician if symptoms persist. Disclaimer: I am an AI, not a doctor.";
      }

      return res.status(200).json({
        success: true,
        response: responseText,
        isMock: true,
      });
    }

    const formattedHistory = [
      {
        role: 'user',
        parts: [{ text: "You are a professional, helpful, and highly intelligent AI medical assistant at Sandeep Hospital. Your tone should be polite and empathetic. Answer user queries concisely. Always add a short disclaimer that your feedback is for informational purposes and the user should consult our hospital doctors for definite diagnoses." }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I will act as the Sandeep Hospital AI medical assistant, providing caring, concise advice with appropriate medical disclaimers." }]
      },
      ...(chatHistory || []).map((h) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }))
    ];

    const responseText = await generateWithModelFallback(formattedHistory, true, message);

    res.status(200).json({
      success: true,
      response: responseText,
      isMock: false,
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(200).json({
      success: true,
      response: "I encountered a transient error connecting to my AI core, but I advise you to stay hydrated, rest, and consult a doctor at Sandeep Hospital for direct care. Please try your question again in a moment.",
      isMock: true,
      error: error.message
    });
  }
};

/**
 * @desc    Symptom checker analysis
 * @route   POST /api/ai/symptom-checker
 * @access  Private
 */
const symptomChecker = async (req, res, next) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Please input symptoms' });
    }

    if (!isGeminiAvailable) {
      return res.status(200).json({
        success: true,
        analysis: {
          possibleConditions: ["Common Cold", "Influenza", "Mild Fatigue"],
          recommendedDepartment: "General Physician",
          urgencyLevel: "Low",
          advice: "Drink warm fluids, monitor your temperature, and rest. If symptoms worsen, schedule an appointment.",
        },
        isMock: true,
      });
    }

    const prompt = `Analyze the following symptoms reported by a patient and output a JSON response.
Symptoms: "${symptoms}"

Format the output strictly as a JSON object with this exact structure:
{
  "possibleConditions": ["Condition A", "Condition B"],
  "recommendedDepartment": "Cardiology/Pediatrics/etc (Must select from: Cardiology, Neurology, Orthopedics, Dentist, ENT, General Physician, Pediatrics, Dermatology, Gynecology, Emergency)",
  "urgencyLevel": "Low/Medium/High",
  "advice": "General home advice or precautions to take before meeting a doctor"
}
Output only the JSON block without markdown code blocks.`;

    let responseText = (await generateWithModelFallback(prompt, false)).trim();

    if (responseText.startsWith('```json')) {
      responseText = responseText.substring(7, responseText.length - 3);
    } else if (responseText.startsWith('```')) {
      responseText = responseText.substring(3, responseText.length - 3);
    }

    let analysis;
    try {
      analysis = JSON.parse(responseText.trim());
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON:', responseText);
      analysis = {
        possibleConditions: ["Undetermined"],
        recommendedDepartment: "General Physician",
        urgencyLevel: "Medium",
        advice: "Please consult our General Physician for an evaluation.",
      };
    }

    res.status(200).json({
      success: true,
      analysis,
      isMock: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Predict disease from symptoms, duration and severity
 * @route   POST /api/ai/predict-disease
 * @access  Private
 */
const predictDisease = async (req, res, next) => {
  try {
    const { symptoms, duration, severity } = req.body;

    if (!symptoms || !duration || !severity) {
      return res.status(400).json({ success: false, message: 'Please provide symptoms, duration and severity' });
    }

    if (!isGeminiAvailable) {
      return res.status(200).json({
        success: true,
        prediction: {
          suspectedIssue: "Acute Respiratory Infection",
          riskScore: "45%",
          recommendedDepartment: "General Physician",
          precautions: ["Isolate to protect others", "Wear mask", "Drink steam/hot water"],
        },
        isMock: true,
      });
    }

    const prompt = `Based on these patient inputs:
Symptoms: "${symptoms}"
Duration: "${duration}"
Severity: "${severity}"

Predict the potential disease risk assessment and output as a JSON object strictly in this structure:
{
  "suspectedIssue": "Primary suspected issue name",
  "riskScore": "Percentage string (e.g. 30%)",
  "recommendedDepartment": "Cardiology/Neurology/Orthopedics/Dentist/ENT/General Physician/Pediatrics/Dermatology/Gynecology/Emergency",
  "precautions": ["precaution 1", "precaution 2"]
}
Output only the JSON block without markdown code blocks.`;

    let responseText = (await generateWithModelFallback(prompt, false)).trim();

    if (responseText.startsWith('```json')) {
      responseText = responseText.substring(7, responseText.length - 3);
    } else if (responseText.startsWith('```')) {
      responseText = responseText.substring(3, responseText.length - 3);
    }

    let prediction;
    try {
      prediction = JSON.parse(responseText.trim());
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON:', responseText);
      prediction = {
        suspectedIssue: "General fatigue or fever",
        riskScore: "10%",
        recommendedDepartment: "General Physician",
        precautions: ["Rest", "Hydrate"],
      };
    }

    res.status(200).json({
      success: true,
      prediction,
      isMock: false,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatbotAssistant,
  symptomChecker,
  predictDisease,
};
