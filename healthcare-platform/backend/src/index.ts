import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './utils/initDb';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import medicalConditionRoutes from './routes/medicalConditionRoutes';
import allergyRoutes from './routes/allergyRoutes';
import symptomRoutes from './routes/symptomRoutes';
import aiDocRoutes from './routes/aiDocRoutes';
import doctorRoutes from './routes/doctorRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import diseaseRoutes from './routes/diseaseRoutes';
import alertRoutes, { createAlertsTable } from './routes/alertRoutes';
import nutritionRoutes from './routes/nutritionRoutes';
import mentalHealthRoutes from './routes/mentalHealthRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { authMiddleware, AuthRequest } from './middleware/authMiddleware';
import pool from './config/database';

const Razorpay = require('razorpay');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Razorpay with dummy keys (or env vars)
const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID || 'rzp_test_YourTestKey',
  key_secret: process.env.RZP_KEY_SECRET || 'YourTestSecret'
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize database + extra tables
(async () => {
  await initializeDatabase();
  await createAlertsTable(pool);
})().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medical-conditions', medicalConditionRoutes);
app.use('/api/allergies', allergyRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/ai-doc', aiDocRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/mental-health', mentalHealthRoutes);
app.use('/api/analytics', analyticsRoutes);

app.post('/api/create-order', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    const options = {
      amount: 49900, // amount in the smallest currency unit (paise) = ₹499
      currency: "INR",
      receipt: `receipt_order_${req.userId}`
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err: any) {
    console.error('Razorpay Order Error:', err);
    res.status(500).json({ error: 'Failed to create payment order', details: err.message });
  }
});

// Subscription endpoint
app.post('/api/subscribe', authMiddleware, async (req: AuthRequest, res: any) => {
  try {
    await pool.query('UPDATE users SET is_premium=true WHERE id=$1', [req.userId]);
    res.json({ message: 'Subscribed to Wellness Premium' });
  } catch (err) {
    res.status(500).json({ error: 'Subscription failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
