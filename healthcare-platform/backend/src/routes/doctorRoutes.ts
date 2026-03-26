import { Router, Response, Request } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Seed sample doctors on first request
async function seedDoctors() {
  const count = await pool.query('SELECT COUNT(*) FROM doctors');
  if (parseInt(count.rows[0].count) > 0) return;

  const doctors = [
    // Karnataka - Bangalore
    ['Dr. Priya Sharma', 'priya.sharma@example.com', '+91 98765 43210', 'General Physician', 'MBBS, MD', 12, 'Apollo Clinic', 'MG Road, Bangalore', 'Karnataka', 'Bangalore Urban', 'Koramangala', 4.8],
    ['Dr. Rajesh Kumar', 'rajesh.kumar@example.com', '+91 98765 43211', 'Cardiologist', 'MBBS, MD, DM Cardiology', 18, 'Heart Care Center', 'Koramangala, Bangalore', 'Karnataka', 'Bangalore Urban', 'Koramangala', 4.9],
    ['Dr. Anita Patel', 'anita.patel@example.com', '+91 98765 43212', 'Dermatologist', 'MBBS, MD Dermatology', 8, 'SkinCare Clinic', 'Indiranagar, Bangalore', 'Karnataka', 'Bangalore Urban', 'Indiranagar', 4.7],
    
    // Karnataka - Mysore
    ['Dr. S. K. Murthy', 'sk.murthy@example.com', '+91 98765 43220', 'Pediatrician', 'MBBS, DCH', 15, 'Mysuru Kid Care', 'Siddhartha Layout, Mysore', 'Karnataka', 'Mysore', 'Siddhartha Layout', 4.8],

    // Maharashtra - Mumbai
    ['Dr. Rahul Mehta', 'rahul.mehta@example.com', '+91 98765 43230', 'Orthopedist', 'MBBS, MS Ortho', 14, 'Mumbai Ortho Center', 'Andheri West, Mumbai', 'Maharashtra', 'Mumbai', 'Andheri', 4.7],
    ['Dr. Sameera Khan', 'sameera.khan@example.com', '+91 98765 43231', 'Gynecologist', 'MBBS, DGO', 11, 'Elite Women Clinic', 'Bandra East, Mumbai', 'Maharashtra', 'Mumbai', 'Bandra', 4.9],
    
    // Delhi - New Delhi
    ['Dr. Amit Goel', 'amit.goel@example.com', '+91 98765 43240', 'Neurologist', 'MBBS, MD, DM Neuro', 20, 'Delhi Neuro Hospital', 'Connaught Place, Delhi', 'Delhi', 'New Delhi', 'Connaught Place', 4.9],
    ['Dr. Neha Gupta', 'neha.gupta@example.com', '+91 98765 43241', 'Endocrinologist', 'MBBS, MD', 9, 'Delhi Diabetes Hub', 'Saket, Delhi', 'Delhi', 'South Delhi', 'Saket', 4.8],
    
    // Telangana - Hyderabad
    ['Dr. Venkat Rao', 'venkat.rao@example.com', '+91 98765 43250', 'ENT Specialist', 'MBBS, MS ENT', 16, 'Hyderabad ENT Care', 'Gachibowli, Hyderabad', 'Telangana', 'Hyderabad', 'Gachibowli', 4.7],
    ['Dr. Lakshmi Devi', 'lakshmi.devi@example.com', '+91 98765 43251', 'Oncologist', 'MBBS, MD, DM', 22, 'Care Cancer Center', 'Jubilee Hills, Hyderabad', 'Telangana', 'Hyderabad', 'Jubilee Hills', 4.9],
  ];

  for (const d of doctors) {
    await pool.query(
      `INSERT INTO doctors (name, email, phone, specialty, qualifications, experience_years, clinic_name, clinic_address, state, district, locality, rating, verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true)
       ON CONFLICT (email) DO NOTHING`,
      d
    );
  }
}

router.get('/', async (req: Request, res: Response) => {
  try {
    await seedDoctors();
    const { search, specialty, state, district, locality, page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = 'SELECT * FROM doctors WHERE verified=true';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR specialty ILIKE $${params.length} OR clinic_name ILIKE $${params.length})`;
    }
    if (specialty) {
      params.push(specialty);
      query += ` AND specialty=$${params.length}`;
    }
    if (state) {
      params.push(state);
      query += ` AND state=$${params.length}`;
    }
    if (district) {
      params.push(district);
      query += ` AND district=$${params.length}`;
    }
    if (locality) {
      params.push(locality);
      query += ` AND locality=$${params.length}`;
    }

    query += ` ORDER BY rating DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const totalResult = await pool.query('SELECT COUNT(*) FROM doctors WHERE verified=true');
    res.json({ doctors: result.rows, total: parseInt(totalResult.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Location metadata endpoints
router.get('/states', async (_req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT state FROM doctors ORDER BY state');
    res.json(result.rows.map((r: any) => r.state));
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.get('/districts', async (req, res) => {
  try {
    const { state } = req.query;
    const result = await pool.query('SELECT DISTINCT district FROM doctors WHERE state=$1 ORDER BY district', [state]);
    res.json(result.rows.map((r: any) => r.district));
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.get('/localities', async (req, res) => {
  try {
    const { district } = req.query;
    const result = await pool.query('SELECT DISTINCT locality FROM doctors WHERE district=$1 ORDER BY locality', [district]);
    res.json(result.rows.map((r: any) => r.locality));
  } catch { res.status(500).json({ error: 'Failed' }); }
});

router.get('/specialties', async (_req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT specialty FROM doctors ORDER BY specialty');
    res.json(result.rows.map((r: any) => r.specialty));
  } catch {
    res.status(500).json({ error: 'Failed' });
  }
});

// Book appointment
router.post('/:doctorId/book', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { appointment_date, consultation_mode, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO appointments (user_id, doctor_id, appointment_date, consultation_mode, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.userId, req.params.doctorId, appointment_date, consultation_mode || 'in-person', notes || '']
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Booking failed' });
  }
});

router.get('/appointments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT a.*, d.name as doctor_name, d.specialty, d.clinic_name
       FROM appointments a JOIN doctors d ON a.doctor_id = d.id
       WHERE a.user_id=$1 ORDER BY a.appointment_date DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

export default router;
