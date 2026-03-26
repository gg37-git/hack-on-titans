import { Router, Response } from 'express';
import pool from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import axios from 'axios';

const router = Router();

router.post('/mood', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { mood, context, energy_level } = req.body;
    const result = await pool.query(
      `INSERT INTO mood_logs (user_id, mood, context, energy_level)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.userId, mood, context, energy_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

router.get('/mood-history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mood_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

router.post('/chat', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversation_history, current_mood } = req.body;
    const openaiKey = process.env.OPENAI_API_KEY;

    let reply = '';
    const prompt = `You are an incredibly empathetic, validating, and highly trained clinical psychologist.
The user is reaching out for mental health support.
Their current logged mood state is: "${current_mood || 'Not explicitly shared'}".
Your behavior:
1. Validate their emotions unconditionally. NEVER dismiss their feelings.
2. If they report feeling "${current_mood}", mirror that understanding deeply. Tell them it makes sense to feel that way.
3. Offer gentle, extremely practical psychological tools (e.g., ACT defusion techniques, CBT reframing, or somatic grounding like the 5-4-3-2-1 method).
4. Be warm and conversational, never robotic. Write naturally, as if sitting across a cozy room holding a warm cup of tea.
5. If they express intent for self-harm, gently yet firmly guide them to emergency services or hotlines immediately.
Format: Write in short, highly readable paragraphs. Use empathetic language ("I hear you", "That sounds completely overwhelming", "It makes total sense why you'd feel that way").`;

    if (openaiKey && openaiKey !== 'your_openai_key_for_ai_doc') {
      try {
        const aiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: prompt },
              ...(conversation_history || []).slice(-10),
              { role: 'user', content: message }
            ],
            temperature: 0.8
          },
          { headers: { Authorization: `Bearer ${openaiKey}` } }
        );
        reply = aiRes.data.choices[0].message.content;
      } catch (err) {
        reply = getMockMentalHealthReply(message, current_mood);
      }
    } else {
      reply = getMockMentalHealthReply(message, current_mood);
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Chat session failed' });
  }
});

function getMockMentalHealthReply(message: string, mood: string): string {
  const lower = message.toLowerCase();
  
  // Dynamic Context Extractor
  const subjects = {
    work: lower.match(/(work|job|boss|office|career|meeting)/),
    relationship: lower.match(/(partner|husband|wife|boyfriend|girlfriend|they|breakup)/),
    family: lower.match(/(mom|dad|parents|family|kids|children)/),
    health: lower.match(/(sleep|tired|sick|pain|headache|insomnia)/),
    severe: lower.match(/(kill|die|suicide|end it|give up|can't do this anymore)/)
  };

  if (subjects.severe) {
    return "I am so deeply sorry you are experiencing this level of pain. Please know you are not alone, and there is support available right now. Please reach out to the National Emergency Hotline at 112 or contact the mental health crisis center at 9820466726 immediately. Your life has immense value.";
  }

  // Empathetic Openers based on Mood
  const openers = [
    `I'm really listening. `,
    `Thank you for sharing that with me. `,
    `It sounds like you're carrying a lot right now. `,
    `I hear you, and it makes complete sense you'd feel that way. `,
    `That sounds incredibly difficult to navigate alone. `
  ];
  const randomOpener = openers[Math.floor(Math.random() * openers.length)];

  if (subjects.work) {
    return `${randomOpener} Work pressure can completely drain our cognitive reserves. When we feel overwhelmed professionally, it's easy to lose our sense of self. Have you been able to completely disconnect and take a true break recently, or has the stress been bleeding into your evenings?`;
  }
  
  if (subjects.relationship || subjects.family) {
    return `${randomOpener} Interpersonal relationships hold so much emotional weight. When there is friction with people we care about, it naturally elevates our anxiety. How are you holding your boundaries right now? It's okay to protect your peace.`;
  }

  if (subjects.health) {
    return `${randomOpener} Our physical and mental states are deeply connected. When you aren't sleeping properly or feeling well, emotional regulation becomes ten times harder. Would you be open to trying a 2-minute somatic grounding exercise to help nervous system regulation?`;
  }

  if (lower.match(/(anxious|panic|racing|stress|pressure|worry|overthink)/)) {
    return `${randomOpener} Anxiety has a way of convincing us that everything is an emergency. Let's gently pause for a second. Try to look around your room and name 3 things you can see, 2 things you can touch, and 1 thing you can hear. This 3-2-1 technique helps pull the brain out of the fight-or-flight loop. How does your breathing feel right now?`;
  }

  if (lower.match(/(sad|depress|hopeless|lonely|cry|unhappy|down|empty)/) || mood === 'sad') {
    return `${randomOpener} Sadness is a heavy blanket, and it's okay if you just need to safely feel it without trying to 'fix' it immediately. Sometimes the bravest thing we can do is just sit with ourselves and acknowledge the pain. What is one tiny, gentle thing you could do for yourself today? Even just drinking a glass of water counts.`;
  }

  if (lower.includes('?') && lower.length > 15) {
    return `That is a really valid question, and there's no single easy answer. Often, when our nervous system is overwhelmed, we seek absolute certainty. What does your intuition naturally lean towards when things are quiet?`;
  }

  // Default deep conversational fallback
  const fallbacks = [
    "I appreciate you opening up to me. When you think about what you just shared, where do you feel the tension in your body?",
    "That is incredibly insightful of you to notice. How long have you been carrying this specific feeling?",
    "Your feelings are completely valid. I'm right here with you. What feels like the heaviest part of all this?",
    "I'm listening. Sometimes just putting these thoughts into words is a massive step. What kind of support do you think you need the most right now in this exact moment?"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export default router;
