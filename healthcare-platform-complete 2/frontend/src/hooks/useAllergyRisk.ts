import { useState, useCallback } from 'react';
import apiClient from '@/lib/api';

export interface AllergyRiskInput {
  known_allergies: string[];
  prescribed_medicines: string[];
  food_intake: string[];
  age: number;
  season: 'summer' | 'winter' | 'monsoon' | 'spring';
  existing_conditions: string[];
}

export interface AllergyRiskResult {
  probability: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  triggered_by: string[];
  recommendation: string;
}

export interface AllergyHistoryItem {
  _id: string;
  timestamp: string;
  inputs: AllergyRiskInput;
  result: AllergyRiskResult;
}

export function useAllergyRisk() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AllergyRiskResult | null>(null);
  const [history, setHistory] = useState<AllergyHistoryItem[]>([]);

  const checkRisk = useCallback(async (input: AllergyRiskInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/allergy-risk/check', input);
      setResult(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check allergy risk');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveToHistory = useCallback(async (inputs: AllergyRiskInput, result: AllergyRiskResult) => {
    try {
      await apiClient.post('/allergy-risk/save', { inputs, result });
      // Refresh history if needed or just optimistic update
    } catch (err) {
      console.error('Failed to save to history');
    }
  }, []);

  const fetchHistory = useCallback(async (userId: number) => {
    try {
      const res = await apiClient.get(`/allergy-risk/history/${userId}`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  }, []);

  return {
    checkRisk,
    saveToHistory,
    fetchHistory,
    isLoading,
    error,
    result,
    setResult,
    history
  };
}
