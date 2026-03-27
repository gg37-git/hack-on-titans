import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const COMMON_CONDITIONS = [
  'Diabetes (Type 1)', 'Diabetes (Type 2)', 'Hypertension', 'Asthma', 'Heart Disease',
  'Thyroid Disorder', 'Arthritis', 'Depression', 'Anxiety Disorder', 'PCOS',
  'Chronic Kidney Disease', 'COPD', 'Epilepsy', 'Migraine', 'Anemia',
  'Obesity', 'Sleep Apnea', 'Osteoporosis', 'Psoriasis', 'IBS'
];

router.get('/options', (_req, res) => {
  res.json({ conditions: COMMON_CONDITIONS });
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medical_conditions WHERE user_id=$1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conditions' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { condition_name, diagnosis_date, notes } = req.body;
    if (!condition_name) return res.status(400).json({ error: 'Condition name required' });

    const result = await pool.query(
      'INSERT INTO medical_conditions (user_id, condition_name, diagnosis_date, notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.userId, condition_name, diagnosis_date || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add condition' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM medical_conditions WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    res.json({ message: 'Condition removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove condition' });
  }
});

export default router;
