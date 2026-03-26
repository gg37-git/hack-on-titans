import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Add alerts table if not exists - called during init
export async function createAlertsTable(poolInstance: any) {
  await poolInstance.query(`
    CREATE TABLE IF NOT EXISTS medical_alerts (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      alert_type VARCHAR(50) DEFAULT 'medication',
      severity VARCHAR(20) DEFAULT 'info',
      is_active BOOLEAN DEFAULT TRUE,
      due_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medical_alerts WHERE user_id=$1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, alert_type, severity, due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const result = await pool.query(
      'INSERT INTO medical_alerts (user_id, title, description, alert_type, severity, due_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.userId, title, description, alert_type || 'medication', severity || 'info', due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, is_active, alert_type, severity, due_date } = req.body;
    const result = await pool.query(
      `UPDATE medical_alerts SET title=COALESCE($1,title), description=COALESCE($2,description),
       is_active=COALESCE($3,is_active), alert_type=COALESCE($4,alert_type), severity=COALESCE($5,severity),
       due_date=COALESCE($6,due_date) WHERE id=$7 AND user_id=$8 RETURNING *`,
      [title, description, is_active, alert_type, severity, due_date, req.params.id, req.userId]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM medical_alerts WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    res.json({ message: 'Alert deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
