import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET profile
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.full_name, u.email, u.phone, p.*
       FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.userId]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST/PUT profile
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { date_of_birth, gender, height_cm, weight_kg, blood_group,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, phone } = req.body;

    // Update user phone
    if (phone) await pool.query('UPDATE users SET phone=$1 WHERE id=$2', [phone, req.userId]);

    // Upsert profile
    await pool.query(`
      INSERT INTO user_profiles (user_id, date_of_birth, gender, height_cm, weight_kg, blood_group,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (user_id) DO UPDATE SET
        date_of_birth = EXCLUDED.date_of_birth, gender = EXCLUDED.gender,
        height_cm = EXCLUDED.height_cm, weight_kg = EXCLUDED.weight_kg,
        blood_group = EXCLUDED.blood_group,
        emergency_contact_name = EXCLUDED.emergency_contact_name,
        emergency_contact_phone = EXCLUDED.emergency_contact_phone,
        emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
        updated_at = NOW()
    `, [req.userId, date_of_birth, gender, height_cm, weight_kg, blood_group,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship]);

    await pool.query('UPDATE users SET profile_completed=true WHERE id=$1', [req.userId]);

    res.json({ message: 'Profile saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

export default router;
