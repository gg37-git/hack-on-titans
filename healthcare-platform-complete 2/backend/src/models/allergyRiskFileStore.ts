import fs from 'fs';
import path from 'path';

const ALLERGY_HISTORY_FILE = path.join(__dirname, '../../allergy_history.json');

export interface IAllergyCheck {
  _id: string;
  userId: number;
  timestamp: string;
  inputs: {
    known_allergies: string[];
    prescribed_medicines: string[];
    food_intake: string[];
    age: number;
    season: string;
    existing_conditions: string[];
  };
  result: {
    probability: number;
    risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
    triggered_by: string[];
    recommendation: string;
  };
}

class AllergyRiskStore {
  private data: IAllergyCheck[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(ALLERGY_HISTORY_FILE)) {
        const content = fs.readFileSync(ALLERGY_HISTORY_FILE, 'utf-8');
        this.data = JSON.parse(content);
      }
    } catch (err) {
      console.error('Failed to load allergy history:', err);
      this.data = [];
    }
  }

  private save() {
    try {
      fs.writeFileSync(ALLERGY_HISTORY_FILE, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error('Failed to save allergy history:', err);
    }
  }

  async findByUserId(userId: number): Promise<IAllergyCheck[]> {
    return this.data
      .filter(h => h.userId === userId)
      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async create(record: Omit<IAllergyCheck, '_id'>): Promise<IAllergyCheck> {
    const newRecord = {
      ...record,
      _id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    };
    this.data.push(newRecord);
    this.save();
    return newRecord;
  }
}

export const allergyRiskStore = new AllergyRiskStore();
