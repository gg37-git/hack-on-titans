import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import HealthScore from '../models/healthScoreModel';

const router = Router();

// Sigmoid function to mimic Logistic Regression output (0 to 1 scaling)
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

// Scoring Logic (Logistic Regression Simulation)
function calculateHealthScore(data: any) {
  const { bmi, blood_pressure, sugar_level, sleep_hours, exercise_frequency, stress_level, existing_conditions } = data;

  // Weights (Simplified coefficients)
  const weights = {
    bmi: -0.15, // High BMI negative impact
    bp: -0.2,   // High BP negative impact
    sugar: -0.1,
    sleep: 0.25,
    exercise: 0.3,
    stress: -0.2,
    conditions: -0.3
  };

  // Feature Scaling/Normalization (Approximate)
  const x_bmi = Math.abs(22.5 - bmi) < 5 ? 1 : 0.5; // Optimal BMI 18.5-25
  const x_bp = blood_pressure < 130 ? 1 : 0.4;
  const x_sugar = sugar_level < 140 ? 1 : 0.4;
  const x_sleep = sleep_hours >= 7 && sleep_hours <= 9 ? 1 : (sleep_hours < 5 ? 0.2 : 0.5);
  const x_exercise = exercise_frequency >= 5 ? 1 : (exercise_frequency >= 3 ? 0.7 : 0.3);
  const x_stress = stress_level <= 3 ? 1 : (stress_level >= 7 ? 0.2 : 0.5);
  const x_conditions = existing_conditions ? 0.4 : 1;

  // Calculation: z = sum(w*x) + intercept
  const z = (weights.bmi * (1-x_bmi)) + 
            (weights.bp * (1-x_bp)) + 
            (weights.sugar * (1-x_sugar)) + 
            (weights.sleep * x_sleep) + 
            (weights.exercise * x_exercise) + 
            (weights.stress * (1-x_stress)) + 
            (weights.conditions * (1-x_conditions)) + 
            2; // Base offset to keep it in a healthy range

  const probability = sigmoid(z);
  const finalScore = Math.min(Math.round(probability * 100), 100);

  return {
    score: finalScore,
    breakdown: {
      bmi_score: Math.round(x_bmi * 100),
      bp_score: Math.round(x_bp * 100),
      sleep_score: Math.round(x_sleep * 100),
      exercise_score: Math.round(x_exercise * 100),
      stress_score: Math.round(x_stress * 100)
    }
  };
}

// POST /api/health-score - Save daily score
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const calcResult = calculateHealthScore(req.body);
    
    // Check if score for today already exists, update or create
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await HealthScore.findOne({
      userId: req.userId as number,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
      existing.score = calcResult.score;
      existing.breakdown = calcResult.breakdown;
      await existing.save();
      return res.json(existing);
    }

    const newScore = new HealthScore({
      userId: req.userId,
      score: calcResult.score,
      breakdown: calcResult.breakdown,
      date: new Date()
    });

    await newScore.save();
    res.status(201).json(newScore);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save health score' });
  }
});

// GET /api/health-score/weekly/:userId - Get last 7 days
router.get('/weekly/:userId', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const days = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0,0,0,0);

    const scores = await HealthScore.find({
      userId: Number(req.params.userId || req.userId),
      date: { $gte: startDate }
    } as any).sort({ date: 1 });

    // Ensure we have 7 days by filling gaps if necessary (simple mock data for missing days)
    const formattedData = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        
        const dayScore = scores.find(s => s.date.toISOString().split('T')[0] === dStr);
        if (dayScore) {
          formattedData.push(dayScore);
        } else {
          // If no data, return a mock/placeholder for development as requested
          formattedData.push({
            date: d,
            score: 0, // In production this would be 0 or null, but for dev we can fill with mock if empty
            isMock: true
          });
        }
    }

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weekly scores' });
  }
});

// SEED MOCK DATA (For Development)
router.post('/seed-sample', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        await HealthScore.deleteMany({ userId: req.userId as number });
        const mockData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const score = 55 + Math.floor(Math.random() * 40);
            mockData.push({
                userId: req.userId,
                score,
                date: d,
                breakdown: {
                    bmi_score: 80,
                    bp_score: 75,
                    sleep_score: 90,
                    exercise_score: 60,
                    stress_score: 70
                }
            });
        }
        await HealthScore.insertMany(mockData);
        res.json({ message: 'Seeded 7 days of mock data' });
    } catch (err) {
        res.status(500).json({ error: 'Seeding failed' });
    }
});

export default router;
