import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const COMMON_ALLERGENS = [
  'Peanuts', 'Tree Nuts', 'Milk/Dairy', 'Eggs', 'Wheat/Gluten', 'Soy',
  'Fish', 'Shellfish', 'Sesame', 'Dust Mites', 'Pollen', 'Pet Dander',
  'Mold', 'Latex', 'Penicillin', 'Aspirin', 'NSAIDs', 'Sulfa Drugs',
  'Insect Stings', 'Nickel'
];

router.get('/options', (_req, res) => {
  res.json({ allergens: COMMON_ALLERGENS });
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM allergies WHERE user_id=$1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch allergies' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { allergy_name, severity, reaction_description, medical_action_required } = req.body;
    if (!allergy_name) return res.status(400).json({ error: 'Allergy name required' });

    const result = await pool.query(
      `INSERT INTO allergies (user_id, allergy_name, severity, reaction_description, medical_action_required)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.userId, allergy_name, severity || 'mild', reaction_description || null, medical_action_required || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add allergy' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM allergies WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    res.json({ message: 'Allergy removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove allergy' });
  }
});

export default router;
