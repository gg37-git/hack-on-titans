'use client';

import { useState } from 'react';
import { X, Activity, Heart, Moon, Zap, Target } from 'lucide-react';
import apiClient from '@/lib/api';

interface LogHealthFormProps {
  onIdChange?: () => void;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LogHealthForm({ onClose, onSuccess }: LogHealthFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bmi: 22.5,
    blood_pressure: 120,
    sugar_level: 90,
    sleep_hours: 8,
    exercise_frequency: 3,
    stress_level: 5,
    existing_conditions: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/health-score', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error logging health data:', error);
      alert('Failed to save readings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl shadow-primary-900/20 overflow-hidden animate-in zoom-in duration-300">
        <header className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Health Log</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Submit actual readings for analysis</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-blue-500" /> BMI
              </label>
              <input
                type="number"
                name="bmi"
                step="0.1"
                value={formData.bmi}
                onChange={handleChange}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-primary-700 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Heart size={14} className="text-rose-500" /> Blood Pressure
              </label>
              <input
                type="number"
                name="blood_pressure"
                value={formData.blood_pressure}
                onChange={handleChange}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-primary-700 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Sugar Level
              </label>
              <input
                type="number"
                name="sugar_level"
                value={formData.sugar_level}
                onChange={handleChange}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-primary-700 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Moon size={14} className="text-indigo-500" /> Sleep (Hours)
              </label>
              <input
                type="number"
                name="sleep_hours"
                step="0.5"
                value={formData.sleep_hours}
                onChange={handleChange}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-primary-700 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exercise Freq (Days/Week)</label>
              <span className="text-sm font-black text-primary-700">{formData.exercise_frequency}</span>
            </div>
            <input
              type="range"
              name="exercise_frequency"
              min="0"
              max="7"
              value={formData.exercise_frequency}
              onChange={handleChange}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-700"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stress Level (1-10)</label>
              <span className="text-sm font-black text-rose-600">{formData.stress_level}</span>
            </div>
            <input
              type="range"
              name="stress_level"
              min="1"
              max="10"
              value={formData.stress_level}
              onChange={handleChange}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-700 text-white py-6 rounded-[24px] font-black text-lg hover:bg-primary-800 transition-all shadow-xl shadow-primary-200 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <Activity className="animate-spin" size={24} /> : 'Sync Health Vitals'}
          </button>
        </form>
      </div>
    </div>
  );
}
