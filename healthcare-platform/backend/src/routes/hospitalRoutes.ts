import { Router, Response, Request } from 'express';
import pool from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    // Return a massive default batch (up to 100) instantly without filters
    const { search, state, district, page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = 'SELECT * FROM hospitals WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR address ILIKE $${params.length})`;
    }
    if (state) {
      params.push(state);
      query += ` AND state=$${params.length}`;
    }
    if (district) {
      params.push(district);
      query += ` AND district=$${params.length}`;
    }

    query += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const totalResult = await pool.query('SELECT COUNT(*) FROM hospitals');
    res.json({ hospitals: result.rows, total: parseInt(totalResult.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// Location metadata endpoints
router.get('/states', async (_req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT state FROM hospitals ORDER BY state');
    res.json(result.rows.map((r: any) => r.state));
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.get('/districts', async (req, res) => {
  try {
    const { state } = req.query;
    const result = await pool.query('SELECT DISTINCT district FROM hospitals WHERE state=$1 ORDER BY district', [state]);
    res.json(result.rows.map((r: any) => r.district));
  } catch { res.status(500).json({ error: 'Failed' }); }
});

export default router;
