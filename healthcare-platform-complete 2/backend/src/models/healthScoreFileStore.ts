import fs from 'fs';
import path from 'path';

const HEALTH_SCORE_FILE = path.join(__dirname, '../../health_scores.json');

export interface IHealthScore {
  _id: string;
  userId: number;
  score: number;
  date: string;
  breakdown: {
    bmi_score: number;
    bp_score: number;
    sleep_score: number;
    exercise_score: number;
    stress_score: number;
  };
}

class HealthScoreStore {
  private data: IHealthScore[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(HEALTH_SCORE_FILE)) {
        const content = fs.readFileSync(HEALTH_SCORE_FILE, 'utf-8');
        this.data = JSON.parse(content);
      }
    } catch (err) {
      console.error('Failed to load health scores:', err);
      this.data = [];
    }
  }

  private save() {
    try {
      fs.writeFileSync(HEALTH_SCORE_FILE, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error('Failed to save health scores:', err);
    }
  }

  async find(query: any): Promise<IHealthScore[]> {
    let filtered = this.data;
    if (query.userId) filtered = filtered.filter(s => s.userId === query.userId);
    if (query.date && query.date.$gte) {
        const gte = new Date(query.date.$gte).getTime();
        filtered = filtered.filter(s => new Date(s.date).getTime() >= gte);
    }
    return filtered.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async findOne(query: any): Promise<IHealthScore | undefined> {
    const scores = await this.find(query);
    if (query.date && query.date.$lt) {
        const lt = new Date(query.date.$lt).getTime();
        const gte = new Date(query.date.$gte).getTime();
        return scores.find(s => {
            const t = new Date(s.date).getTime();
            return t >= gte && t < lt;
        });
    }
    return scores[0];
  }

  async insertMany(scores: any[]): Promise<void> {
    const newScores = scores.map(s => ({
        ...s,
        _id: Math.random().toString(36).substring(7),
        date: s.date instanceof Date ? s.date.toISOString() : s.date
    }));
    this.data.push(...newScores);
    this.save();
  }

  async deleteMany(query: any): Promise<void> {
    const { userId, date } = query;
    if (!userId) return;

    if (date && (date.$gte || date.$lt)) {
      const gte = date.$gte ? new Date(date.$gte).getTime() : -Infinity;
      const lt = date.$lt ? new Date(date.$lt).getTime() : Infinity;

      this.data = this.data.filter(s => {
        if (s.userId !== userId) return true;
        const t = new Date(s.date).getTime();
        return !(t >= gte && t < lt);
      });
    } else {
      this.data = this.data.filter(s => s.userId !== userId);
    }

    this.save();
  }

  async create(score: any): Promise<IHealthScore> {
      const newScore = {
          ...score,
          _id: Math.random().toString(36).substring(7),
          date: score.date instanceof Date ? score.date.toISOString() : (score.date || new Date().toISOString())
      };
      this.data.push(newScore);
      this.save();
      return newScore;
  }
}

export const healthScoreStore = new HealthScoreStore();
