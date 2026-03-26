import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthScore extends Document {
  userId: number;
  score: number;
  date: Date;
  breakdown: {
    bmi_score: number;
    bp_score: number;
    sleep_score: number;
    exercise_score: number;
    stress_score: number;
  };
}

const HealthScoreSchema: Schema = new Schema({
  userId: { type: Number, required: true, index: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now, index: true },
  breakdown: {
    bmi_score: { type: Number, required: true },
    bp_score: { type: Number, required: true },
    sleep_score: { type: Number, required: true },
    exercise_score: { type: Number, required: true },
    stress_score: { type: Number, required: true }
  }
});

export default mongoose.model<IHealthScore>('HealthScore', HealthScoreSchema);
