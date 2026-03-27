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
    const prompt = `You are a world-class, deeply empathetic clinical psychologist named CuraLink Empathy.
The user is seeking mental health support. Current mood: "${current_mood || 'Analyzing...'}".

CRITICAL INSTRUCTION:
1. NO REPETITION: Do not use the same phrases repeatedly (e.g., avoid always starting with "I hear you" or "That sounds hard").
2. UNIQUE VOICE: Vary your tone and sentence structure. Use metaphors and personalized validation.
3. CLINICAL DEPTH: Offer one specific, gentle psychological technique per message (ACT, CBT, Somatic).
4. HUMAN TOUCH: Imagine you are writing a heartfelt, handwritten note. No robotic lists.
5. EMERGENCY: If self-harm is mentioned, prioritize the crisis resources provided in your knowledge.

Avoid templated empathy. Be present and genuine.`;

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
    health: lower.match(/(sleep|tired|sick|pair|headache|insomnia)/),
    severe: lower.match(/(kill|die|suicide|end it|give up|can't do this anymore)/)
  };

  if (subjects.severe) {
    return "I am so deeply sorry you are experiencing this level of pain. Please know you are not alone, and there is support available right now. Please reach out to the National Emergency Hotline at 112 or contact the mental health crisis center at 9820466726 immediately. Your life has immense value.";
  }

  // Significantly expanded Openers (20+)
  const openers = [
    "I'm here, and I'm really listening to everything you're saying.",
    "Thank you for being so honest with me about how you're feeling.",
    "It sounds like there's a heavy weight on your shoulders right now.",
    "I can tell how much thought and emotion you've put into sharing this.",
    "I hear the struggle in your words, and it's completely valid.",
    "Navigating these feelings alone is incredibly draining. I'm with you.",
    "It makes so much sense that you'd feel this way given what's happening.",
    "I appreciate you trusting me with these vulnerable thoughts.",
    "That sounds like a lot for anyone to carry at once.",
    "I'm sensing a lot of depth in what you're experiencing right now.",
    "It's okay to not have all the answers—just being here is enough.",
    "I really value you opening up to me like this.",
    "That sounds like a truly exhausting situation to be in.",
    "I can feel the resonance of what you're sharing.",
    "Thank you for letting me in on what's going on in your world.",
    "I'm sitting here with you, taking in everything you've said.",
    "It takes immense courage to speak these truths out loud.",
    "It sounds like your heart is dealing with something very complex.",
    "I hear you, and more importantly, I'm here for you.",
    "That sounds like a significant challenge you're facing."
  ];
  const randomOpener = openers[Math.floor(Math.random() * openers.length)];

  if (subjects.work) {
    const workReplies = [
      `${randomOpener} Work can often feel like a landscape where we lose ourselves to the demands of others. When the pressure mounts, it's natural for our inner peace to take a backseat. What does 'unplugging' look like for you, even if just for five minutes?`,
      `${randomOpener} The weight of professional expectations can be a silent thief of joy. It's okay to feel that you're hitting a wall. If you could change just one small thing about your work day tomorrow, what would it be?`,
      `${randomOpener} Career stress isn't just about tasks; it's often about our sense of worth and security. I hear how much this is affecting you. Are you finding any space at all to breathe outside of those office walls?`
    ];
    return workReplies[Math.floor(Math.random() * workReplies.length)];
  }
  
  if (subjects.relationship || subjects.family) {
    return `${randomOpener} The people closest to us can often be the source of our deepest complexities. When there is tension in our 'inner circle,' it vibrates through every other part of our lives. How are you holding your space and your boundaries in the midst of this?`;
  }

  if (subjects.health) {
    return `${randomOpener} Our bodies often hold the stories that our minds aren't ready to tell yet. When physical symptoms and emotional weight collide, it’s incredibly taxing. Have you been able to find one small moment of physical comfort today?`;
  }

  if (lower.match(/(anxious|panic|racing|stress|pressure|worry|overthink)/)) {
    return `${randomOpener} Anxiety can feel like a storm that never ends, convincing us that every shadow is a threat. Let's try to find a small anchor together. Could you try to notice the weight of your feet on the floor for just a moment? How does that feel?`;
  }

  if (lower.match(/(sad|depress|hopeless|lonely|cry|unhappy|down|empty)/) || mood === 'sad') {
    return `${randomOpener} Sadness can feel so isolating, like being in a room where the lights have dimmed. It is okay to be in that space for as long as you need. There is no rush to 'fix' it. What is the kindest thing you could do for yourself in this exact moment?`;
  }

  // Significantly expanded Fallbacks (15+)
  const fallbacks = [
    "I'm reflecting on what you just shared. Where do you feel that emotion resting in your body right now?",
    "That's a very significant observation. How long has this been feeling like the 'norm' for you?",
    "I appreciate you sharing that layer of your story. What feels like the hardest part to say out loud?",
    "I'm listening closely. If these feelings had a voice, what do you think they would be trying to tell you?",
    "Thank you for being here with me. What kind of support—even if it's just a quiet space—feels most needed today?",
    "I can hear the resilience in your voice, even when things feel heavy. What does 'rest' mean to you in this season?",
    "That is a lot to process. When you look at the next few hours, what is one tiny thing that feels manageable?",
    "I hear the complexity in that. Sometimes it's okay to just sit with the 'unknown' for a while. How does that feel?",
    "Your perspective is so important. Have you found anyone else you feel safe sharing even a small part of this with?",
    "I'm sensing there's a lot more beneath the surface. I'm here for all of it, whenever you're ready.",
    "It sounds like you've been carrying this for a long time. It's okay to put the heavy things down for a moment.",
    "That sounds like a very profound shift in how you're feeling. What triggered this realization for you?",
    "I'm following you. It's interesting how our minds try to protect us by feeling certain ways. Does that resonate?",
    "Thank you for trusting me with this. I'm curious, what does a 'good day' look like for you lately?",
    "I'm holding space for everything you've shared. It's a lot, and it's okay to feel overwhelmed by it."
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export default router;
