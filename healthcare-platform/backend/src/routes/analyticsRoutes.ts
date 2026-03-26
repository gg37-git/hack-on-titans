import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.get('/risk-scores', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const profileRes = await pool.query('SELECT * FROM user_profiles WHERE user_id=$1', [req.userId]);
    const conditionsRes = await pool.query('SELECT * FROM medical_conditions WHERE user_id=$1', [req.userId]);
    const historyRes = await pool.query('SELECT * FROM symptom_checks WHERE user_id=$1', [req.userId]);

    const profile = profileRes.rows[0] || {};
    const conditions = conditionsRes.rows.map(c => c.condition_name.toLowerCase());

    // Simple mock algorithm for risk scoring
    let heartRisk = 15; // Base risk
    let diabetesRisk = 20;
    let respiratoryRisk = 10;

    // Adjust based on age
    const ageValue = profile.date_of_birth ? (new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()) : 30;
    if (ageValue > 50) { heartRisk += 20; diabetesRisk += 15; }

    // Adjust based on BMI (Height/Weight)
    if (profile.height_cm && profile.weight_kg) {
      const heightInM = profile.height_cm / 100;
      const bmi = profile.weight_kg / (heightInM * heightInM);
      if (bmi > 25) { heartRisk += 10; diabetesRisk += 20; }
    }

    // Adjust based on medical conditions
    if (conditions.includes('hypertension') || conditions.includes('high blood pressure')) heartRisk += 30;
    if (conditions.includes('asthma') || conditions.includes('copd')) respiratoryRisk += 40;

    const scores = [
      {
        name: 'Cardiovascular Health',
        score: Math.min(heartRisk, 100),
        status: getStatus(heartRisk),
        recommendations: ["Regular cardio for 30 mins", "Reduce sodium intake", "Monitor blood pressure weekly"]
      },
      {
        name: 'Metabolic Health (Diabetes)',
        score: Math.min(diabetesRisk, 100),
        status: getStatus(diabetesRisk),
        recommendations: ["Shift to whole grains", "Limit processed sugars", "Morning walks for 4k steps"]
      },
      {
        name: 'Respiratory Wellness',
        score: Math.min(respiratoryRisk, 100),
        status: getStatus(respiratoryRisk),
        recommendations: ["Practice deep breathing", "Avoid polluted areas", "Regular steam inhalation"]
      }
    ];

    res.json({ scores, last_updated: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate risk scores' });
  }
});

function getStatus(score: number): string {
  if (score < 30) return 'Optimal';
  if (score < 60) return 'Moderate';
  return 'High Risk';
}

router.get('/preventive-remedies', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { condition } = req.query;
    // Static preventive data for now
    const remedies: any = {
      'Diabetes': {
        remedies: ["Bitter gourd (Karela) juice", "Fenugreek seeds (Methi) water", "Cinnamon tea"],
        lifestyle: ["Active lifestyle", "Stress management", "Adequate sleep"]
      },
      'Hypertension': {
        remedies: ["Garlic cloves", "Beetroot juice", "Amla"],
        lifestyle: ["Lower salt intake", "Meditation", "Hydration"]
      },
      'General': {
        remedies: ["Turmeric milk (Haldi Doodh)", "Tulsi tea", "Triphala powder"],
        lifestyle: ["Balanced diet", "Daily movement", "Mindfulness"]
      }
    };
    res.json(remedies[condition as string] || remedies['General']);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch remedies' });
  }
});

export default router;
