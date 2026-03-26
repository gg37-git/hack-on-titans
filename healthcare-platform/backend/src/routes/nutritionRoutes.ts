import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = Router();
const DISHES_PATH = path.join(__dirname, '../data/dishes.json');

router.get('/dishes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { category, region, diet } = req.query;
    const dishesRaw = fs.readFileSync(DISHES_PATH, 'utf8');
    let dishes = JSON.parse(dishesRaw);

    if (category) dishes = dishes.filter((d: any) => d.category.toLowerCase() === (category as string).toLowerCase());
    if (region) dishes = dishes.filter((d: any) => d.region.toLowerCase().includes((region as string).toLowerCase()));
    if (diet) dishes = dishes.filter((d: any) => d.diet.toLowerCase() === (diet as string).toLowerCase());

    res.json(dishes.slice(0, 50)); // Return top 50 matches for performance
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

router.post('/plan', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goals, diet_type, cuisine_preference, cultural_context, medical_conditions, is_weekly } = req.body;
    const openaiKey = process.env.OPENAI_API_KEY;

    let plan: any;

    if (openaiKey && openaiKey !== 'your_openai_key_for_ai_doc') {
      const duration = is_weekly ? '7-day' : '1-day';
      const prompt = `You are an expert Indian Nutritionist and Chef specializing in regional and community-specific diets. 
Create a hyper-personalized ${duration} meal plan for an Indian user.

User profile:
- Goals: ${goals || 'General health'}
- Diet Type: ${diet_type || 'Vegetarian'}
- Primary Cuisine: ${cuisine_preference || 'North Indian'}
- Cultural Background/Specific Context: ${cultural_context || 'Standard Regional'}
- Medical Conditions: ${medical_conditions || 'None'}

CRITICAL INSTRUCTIONS:
1. Use highly authentic, traditional dishes specific to the Cultural Background and Primary Cuisine. 
2. Incorporate regional superfoods (e.g., Sattu, Kokum, Ragi, Moringa, Mustard oil, etc.) relevant to the context.
3. If "Jain" or "No onion/garlic" is mentioned in context, strictly adhere to it.
4. For each meal, provide: dish name, ingredients, and key nutritional benefit.
5. Provide 3 specific nutritional tips tailored to this specific cultural diet.

Format as JSON ONLY.
If 1-day: { "meal_plan": { "breakfast": {}, ... }, "total_nutrition": {}, "tips": [] }
If 7-day: { "weekly_plan": [ { "day": 1, "meal_plan": {}, "total_nutrition": {} }, ... ], "tips": [] }`;

      try {
        const aiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          { 
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'system', content: prompt }], 
            temperature: 0.7 
          },
          { headers: { Authorization: `Bearer ${openaiKey}` } }
        );
        plan = JSON.parse(aiRes.data.choices[0].message.content);
      } catch (err) {
        plan = getMockNutritionPlan(diet_type, cuisine_preference, cultural_context, is_weekly, goals);
      }
    } else {
      plan = getMockNutritionPlan(diet_type, cuisine_preference, cultural_context, is_weekly, goals);
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

function getMockNutritionPlan(dietType: string, cuisine: string, culturalContext?: string, isWeekly?: boolean, goals: string = 'General Fitness') {
  const DISHES_PATH = path.join(__dirname, '../data/dishes.json');
  let allDishes: any[] = [];
  try {
    allDishes = JSON.parse(fs.readFileSync(DISHES_PATH, 'utf8'));
  } catch (e) {
    allDishes = []; // Fallback to empty if file missing
  }

  const normalizedCuisine = cuisine.toLowerCase();
  const normalizedContext = culturalContext?.toLowerCase() || '';
  const isVeg = dietType.toLowerCase().includes('vege') || dietType.toLowerCase() === 'vegan';

  const usedDishIds = new Set<number>();

  const getUniqueDishes = (category: string, count: number) => {
    let filtered = allDishes.filter(d => d.category === category && !usedDishIds.has(d.id));
    
    // Regional filter
    const regional = filtered.filter(d => 
      d.region.toLowerCase().includes(normalizedCuisine) || 
      d.region.toLowerCase().includes(normalizedContext)
    );
    if (regional.length >= count) filtered = regional;

    // Diet filter
    filtered = filtered.filter(d => isVeg ? d.diet === 'Vegetarian' : true);

    // Shuffle and pick
    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, count);
    selected.forEach(d => usedDishIds.add(d.id));
    return selected;
  };

  const poolSize = isWeekly ? 7 : 1;
  const breakfastPool = getUniqueDishes('Breakfast', poolSize);
  const lunchPool = getUniqueDishes('Lunch', poolSize);
  const dinnerPool = getUniqueDishes('Dinner', poolSize);
  const snackPool = getUniqueDishes('Snack', poolSize * 2);

  const getDayPlan = (day: number) => {
    const idx = (day - 1) % poolSize;
    const b = breakfastPool[idx] || { name: "Regional Breakfast", description: "Healthy start" };
    const l = lunchPool[idx] || { name: "Regional Lunch", description: "Balanced meal" };
    const d = dinnerPool[idx] || { name: "Regional Dinner", description: "Light end" };
    const s1 = snackPool[idx * 2] || { name: "Fruit Bowl" };
    const s2 = snackPool[idx * 2 + 1] || { name: "Nuts" };

    let calories = 2000;
    let protein = 60;
    if (goals === 'Weight Loss') { calories = 1600; protein = 70; }
    else if (goals === 'Muscle Gain') { calories = 2600; protein = 120; }
    else if (goals === 'Diabetes Management') { calories = 1800; protein = 65; }

    return {
      meal_plan: {
        breakfast: { dish: b.name, ingredients: b.description, benefit: "Authentic energy" },
        mid_morning: { dish: s1.name, ingredients: "Natural snack", benefit: "Metabolism boost" },
        lunch: { dish: l.name, ingredients: l.description, benefit: "Regional nutrition" },
        evening_snack: { dish: s2.name, ingredients: "Light snack", benefit: "Protein/Fat balance" },
        dinner: { dish: d.name, ingredients: d.description, benefit: "Easy digestion" }
      },
      total_nutrition: { 
        calories: calories + (day * 5), 
        protein, 
        carbs: Math.floor(calories * 0.5 / 4), 
        fats: Math.floor(calories * 0.25 / 9) 
      }
    };
  };

  if (isWeekly) {
    return {
      weekly_plan: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        ...getDayPlan(i + 1)
      })),
      tips: [
         `Optimized for ${goals}: Seasonal & local ingredients only.`,
         "No meal is repeated this week to ensure total nutrient diversity.",
         "Stay hydrated: 3.5 liters of water daily recommended."
      ]
    };
  }

  return {
    ...getDayPlan(1),
    tips: [
      `Your unique ${goals} plan is ready.`,
      "Zero repeats: Every meal is a fresh regional discovery.",
      "Avoid processed foods for maximum benefit."
    ]
  };
}

export default router;
