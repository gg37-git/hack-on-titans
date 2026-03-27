import { Router, Response } from 'express';
import axios from 'axios';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { allergyRiskStore } from '../models/allergyRiskFileStore';

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Predict Allergy Risk
router.post('/check', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { known_allergies, prescribed_medicines, food_intake, age, season, existing_conditions } = req.body;

    // Call Python ML Service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict-allergy-risk`, {
      known_allergies,
      prescribed_medicines,
      food_intake,
      age,
      season,
      existing_conditions
    });

    const result = mlResponse.data;

    // Send Gmail notification for critical allergy risk
    if (result.risk_level === 'Critical') {
      const { sendClinicalAlert } = require('../utils/EmailService');
      await sendClinicalAlert(
        `CRITICAL Allergy Risk Detected (Prob: ${Math.round(result.probability * 100)}%)`,
        `<p>A patient has just performed an allergy assessment that resulted in a <strong>CRITICAL</strong> risk level.</p>
         <p><strong>Triggered By:</strong> ${result.triggered_by.join(', ') || 'Unknown triggers'}</p>
         <p><strong>Recommendation:</strong> ${result.recommendation}</p>
         <p><strong>Patient ID:</strong> ${req.userId}</p>`
      );
    }

    // We don't save to history automatically here, user must click 'Save' on frontend
    res.json(result);
  } catch (err: any) {
    console.error('Allergy Prediction Error:', err.message);
    res.status(500).json({ error: 'Failed to get allergy risk prediction. Ensure ML service is running.' });
  }
});

// Save to History
router.post('/save', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { inputs, result } = req.body;
    const record = await allergyRiskStore.create({
      userId: req.userId as number,
      inputs,
      result,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save allergy check to history' });
  }
});

// Get History
router.get('/history/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.userId || req.userId);
    const history = await allergyRiskStore.findByUserId(userId);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch allergy history' });
  }
});

export default router;
