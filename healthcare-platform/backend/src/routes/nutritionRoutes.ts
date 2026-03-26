import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import axios from 'axios';

const router = Router();

router.post('/plan', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goals, diet_type, cuisine_preference, medical_conditions } = req.body;
    const openaiKey = process.env.OPENAI_API_KEY;

    let plan: any;

    if (openaiKey && openaiKey !== 'your_openai_key_for_ai_doc') {
      const prompt = `You are an expert Indian Nutritionist. Create a detailed 1-day meal plan for an Indian user.
User profile:
- Goals: ${goals || 'General health'}
- Diet Type: ${diet_type || 'Vegetarian'}
- Cuisine: ${cuisine_preference || 'North Indian'}
- Medical Conditions: ${medical_conditions || 'None'}

Include:
1. Breakfast, Mid-morning snack, Lunch, Evening snack, Dinner.
2. For each meal, provide: dish name, ingredients, and key nutritional benefit.
3. Total calorie and macronutrient (Protein, Carbs, Fats) estimation.
4. 3 specific nutritional tips for Indians (e.g., related to lentils, spices, or seasonal produce).

Format as JSON: { "meal_plan": { "breakfast": {}, "mid_morning": {}, "lunch": {}, "evening_snack": {}, "dinner": {} }, "total_nutrition": { "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }, "tips": [] }`;

      try {
        const aiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          { model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: prompt }], temperature: 0.7 },
          { headers: { Authorization: `Bearer ${openaiKey}` } }
        );
        plan = JSON.parse(aiRes.data.choices[0].message.content);
      } catch (err) {
        plan = getMockNutritionPlan(diet_type, cuisine_preference);
      }
    } else {
      plan = getMockNutritionPlan(diet_type, cuisine_preference);
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate nutrition plan' });
  }
});

router.post('/log', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { meal_type, food_items, calories, protein, carbs, fats } = req.body;
    const result = await pool.query(
      `INSERT INTO nutrition_logs (user_id, meal_type, food_items, calories, protein, carbs, fats)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, meal_type, food_items, calories, protein, carbs, fats]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log nutrition' });
  }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM nutrition_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nutrition history' });
  }
});

function getMockNutritionPlan(dietType: string, cuisine: string) {
  return {
    meal_plan: {
      breakfast: { dish: "Poha with Sprouts", ingredients: "Flattened rice, moong sprouts, peanuts, curry leaves, turmeric", benefit: "Rich in iron and fiber" },
      mid_morning: { dish: "Buttermilk (Chaas)", ingredients: "Curd, roasted cumin, black salt, coriander", benefit: "Probiotic for digestion" },
      lunch: { dish: "Paneer Tikka Masala with 2 Rotis", ingredients: "Paneer, bell peppers, whole wheat flour, tomato gravy", benefit: "High protein and complex carbs" },
      evening_snack: { dish: "Roasted Makhana", ingredients: "Foxnuts, pinch of salt, turmeric", benefit: "Low-calorie crunch" },
      dinner: { dish: "Dal Tadka with Steamed Rice", ingredients: "Yellow lentils, basmati rice, spinach salad", benefit: "Complete amino acid profile" }
    },
    total_nutrition: { calories: 1850, protein: 65, carbs: 240, fats: 55 },
    tips: [
      "Add Amla or Lemon to your meals to increase Vitamin C for better iron absorption from lentils.",
      "Incorporate seasonal greens like Methi or Palak at least thrice a week.",
      "Use cold-pressed mustard or coconut oil instead of refined vegetable oils."
    ]
  };
}

export default router;
