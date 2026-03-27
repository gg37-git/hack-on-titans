import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import axios from 'axios';

const router = Router();

// POST - analyze symptoms
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symptoms_text, duration, intensity } = req.body;
    if (!symptoms_text) return res.status(400).json({ error: 'Symptoms required' });

    let analysis_result: any;

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey !== 'your_openai_key_for_ai_doc') {
      try {
        const aiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a medical AI assistant. Based on the symptoms described, provide:
1. Possible conditions (list 2-3)
2. Urgency level: "low", "medium", or "high"
3. Recommended actions
4. Warning signs to watch for
Format as JSON: { "possible_conditions": [], "urgency": "", "recommendations": [], "warning_signs": [] }`
              },
              {
                role: 'user',
                content: `Symptoms: ${symptoms_text}. Duration: ${duration || 'not specified'}. Intensity: ${intensity || 'not specified'}/10`
              }
            ],
            temperature: 0.3,
          },
          { headers: { Authorization: `Bearer ${openaiKey}` } }
        );
        const content = aiRes.data.choices[0].message.content;
        analysis_result = JSON.parse(content);
      } catch (aiErr) {
        analysis_result = getMockAnalysis(symptoms_text, intensity);
      }
    } else {
      analysis_result = getMockAnalysis(symptoms_text, intensity);
    }

    // Save to DB
    const result = await pool.query(
      'INSERT INTO symptom_checks (user_id, symptoms_text, duration, intensity, analysis_result) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.userId, symptoms_text, duration, intensity, JSON.stringify(analysis_result)]
    );

    res.json({ ...result.rows[0], analysis: analysis_result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// GET history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM symptom_checks WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

function getMockAnalysis(symptoms: string, intensity: number) {
  const lower = symptoms.toLowerCase();
  const urgency = intensity >= 8 ? 'high' : intensity >= 5 ? 'medium' : 'low';

  if (lower.includes('chest') || lower.includes('heart')) {
    return {
      possible_conditions: ['Angina', 'Costochondritis', 'Acid Reflux'],
      urgency: 'high',
      recommendations: ['Seek immediate medical attention', 'Avoid physical exertion', 'Call emergency services if severe'],
      warning_signs: ['Radiating arm pain', 'Shortness of breath', 'Sweating with chest pain']
    };
  }
  if (lower.includes('fever') || lower.includes('temperature')) {
    return {
      possible_conditions: ['Viral Infection', 'Bacterial Infection', 'Flu'],
      urgency: urgency,
      recommendations: ['Rest and stay hydrated', 'Take fever-reducing medication', 'See a doctor if fever persists >3 days'],
      warning_signs: ['Fever above 103°F', 'Difficulty breathing', 'Severe headache or stiff neck']
    };
  }
  if (lower.includes('headache') || lower.includes('head')) {
    return {
      possible_conditions: ['Tension Headache', 'Migraine', 'Dehydration'],
      urgency: urgency,
      recommendations: ['Rest in a dark, quiet room', 'Stay hydrated', 'Take OTC pain relief if needed'],
      warning_signs: ['Sudden severe "thunderclap" headache', 'Headache with fever and stiff neck', 'Vision changes']
    };
  }
  return {
    possible_conditions: ['General Illness', 'Fatigue', 'Stress-related symptoms'],
    urgency: urgency,
    recommendations: ['Rest adequately', 'Stay hydrated', 'Monitor symptoms and consult a doctor if worsening'],
    warning_signs: ['Symptoms worsening after 48 hours', 'High fever', 'Difficulty breathing']
  };
}

export default router;
