import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';

export interface HealthScoreData {
  _id?: string;
  score: number;
  date: string;
  breakdown: {
    bmi_score: number;
    bp_score: number;
    sleep_score: number;
    exercise_score: number;
    stress_score: number;
  };
  isMock?: boolean;
}

export function useHealthScore(userId?: string) {
  const [loading, setLoading] = useState(true);
  const [weeklyScores, setWeeklyScores] = useState<HealthScoreData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyScores = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/health-score/weekly/${userId || ''}`);
      setWeeklyScores(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch scores');
    } finally {
      setLoading(false);
    }
  };

  const submitDailyScore = async (metrics: any) => {
    try {
      const res = await apiClient.post('/health-score', metrics);
      await fetchWeeklyScores();
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to sync health score');
    }
  };

  const seedMockData = async () => {
    try {
      await apiClient.post('/health-score/seed-sample');
      await fetchWeeklyScores();
    } catch (err) {
      console.error('Seeding failed:', err);
    }
  };

  useEffect(() => {
    fetchWeeklyScores();
  }, [userId]);

  return {
    loading,
    weeklyScores,
    error,
    fetchWeeklyScores,
    submitDailyScore,
    seedMockData
  };
}
