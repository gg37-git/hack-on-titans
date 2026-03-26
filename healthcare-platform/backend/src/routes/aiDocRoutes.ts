import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import axios from 'axios';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversation_history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // Save user message
    await pool.query(
      'INSERT INTO chat_history (user_id, role, message) VALUES ($1, $2, $3)',
      [req.userId, 'user', message]
    );

    let reply = '';
    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey && openaiKey !== 'your_openai_key_for_ai_doc') {
      try {
        const messages = [
          {
            role: 'system',
            content: `You are a knowledgeable, empathetic AI Doctor assistant. You provide helpful health information and guidance. 
Always:
- Be warm, professional and reassuring
- Clarify that you're an AI and not a replacement for real medical care
- Recommend seeing a doctor for serious concerns
- Ask follow-up questions to better understand symptoms
- Give practical, actionable advice`
          },
          ...(conversation_history || []).slice(-8),
          { role: 'user', content: message }
        ];

        const aiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          { model: 'gpt-3.5-turbo', messages, temperature: 0.7, max_tokens: 500 },
          { headers: { Authorization: `Bearer ${openaiKey}` } }
        );
        reply = aiRes.data.choices[0].message.content;
      } catch {
        reply = getMockReply(message);
      }
    } else {
      reply = getMockReply(message);
    }

    // Save AI reply
    await pool.query(
      'INSERT INTO chat_history (user_id, role, message) VALUES ($1, $2, $3)',
      [req.userId, 'assistant', reply]
    );

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM chat_history WHERE user_id=$1 ORDER BY timestamp ASC LIMIT 50',
      [req.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

function getMockReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('fever')) return "I understand you're experiencing a fever. A normal body temperature is around 98.6°F (37°C). A temperature above 100.4°F (38°C) is considered a fever. Make sure to stay hydrated, rest, and take fever-reducing medication like paracetamol if needed. If the fever exceeds 103°F or lasts more than 3 days, please see a doctor. How long have you had the fever?";
  if (lower.includes('headache')) return "Headaches can have many causes - tension, dehydration, stress, or sometimes more serious conditions. Try drinking water, resting in a quiet dark room, and gentle neck stretches. If headaches are frequent, severe, or accompanied by vision changes, please consult a doctor. Can you describe the type of pain - throbbing, pressure, or sharp?";
  if (lower.includes('cold') || lower.includes('cough')) return "A cold typically involves a runny nose, cough, and mild fever. Rest, stay hydrated, and consider OTC cold medicines. Vitamin C and zinc may help. If you develop a high fever, shortness of breath, or symptoms lasting more than 10 days, see a doctor. Are you experiencing any difficulty breathing?";
  if (lower.includes('pain')) return "I'm sorry to hear you're in pain. Could you tell me more about where the pain is located, how long you've had it, and if anything makes it better or worse? This will help me give you better guidance.";
  if (lower.includes('hello') || lower.includes('hi')) return "Hello! I'm your AI Health Assistant. I'm here to help answer your health questions, provide guidance on symptoms, and offer general medical information. Please remember I'm an AI and not a replacement for professional medical care. How can I help you today?";
  return "Thank you for sharing that with me. As your AI health assistant, I want to make sure I give you the most helpful information. Could you tell me more about your symptoms - when they started, their severity, and if you have any existing medical conditions? This will help me provide better guidance.";
}

export default router;
