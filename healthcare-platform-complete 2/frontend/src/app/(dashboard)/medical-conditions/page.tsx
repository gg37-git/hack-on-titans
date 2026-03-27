'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Stethoscope, Calendar, FileText, AlertCircle, Check } from 'lucide-react';
import apiClient from '@/lib/api';

interface Condition {
  id: number;
  condition_name: string;
  diagnosis_date: string;
  notes: string;
}

export default function MedicalConditionsPage() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCondition, setNewCondition] = useState({
    condition_name: '',
    diagnosis_date: '',
    notes: ''
  });

  const fetchConditions = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/medical-conditions');
      setConditions(res.data);
    } catch (error) {
      console.error('Error fetching conditions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await apiClient.get('/medical-conditions/options');
      setOptions(res.data.conditions);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    fetchConditions();
    fetchOptions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondition.condition_name) return;
    try {
      const res = await apiClient.post('/medical-conditions', newCondition);
      setConditions([res.data, ...conditions]);
      setNewCondition({ condition_name: '', diagnosis_date: '', notes: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding condition:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/medical-conditions/${id}`);
      setConditions(conditions.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting condition:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Medical Conditions</h1>
            <p className="text-neutral-500">Keep track of your chronic conditions and diagnoses.</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} /> Add Condition
            </button>
          )}
        </div>

        {isAdding && (
          <div className="card animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4">Add New Condition</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Condition Name</label>
                  <select
                    value={newCondition.condition_name}
                    onChange={(e) => setNewCondition({ ...newCondition, condition_name: e.target.value })}
                    className="input-field h-12"
                    required
                  >
                    <option value="">Select a condition...</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                    <option value="Other">Other (Type in notes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Diagnosis Date</label>
                  <input
                    type="date"
                    value={newCondition.diagnosis_date}
                    onChange={(e) => setNewCondition({ ...newCondition, diagnosis_date: e.target.value })}
                    className="input-field h-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Notes (Optional)</label>
                <textarea
                  value={newCondition.notes}
                  onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                  placeholder="E.g. Currently taking Metformin, daily monitoring..."
                  className="input-field min-h-[100px]"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Condition</button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-neutral-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : conditions.length === 0 ? (
          <div className="card text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-3xl mx-auto">🩺</div>
            <p className="text-neutral-500">No medical conditions recorded yet.</p>
            <button onClick={() => setIsAdding(true)} className="text-primary-700 font-bold hover:underline">Add your first condition</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {conditions.map((c) => (
              <div key={c.id} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">{c.condition_name}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-neutral-500">
                      {c.diagnosis_date && (
                        <span className="flex items-center gap-1"><Calendar size={14} /> Diagnosed: {new Date(c.diagnosis_date).toLocaleDateString()}</span>
                      )}
                      {c.notes && (
                        <span className="flex items-center gap-1"><FileText size={14} /> {c.notes.substring(0, 50)}{c.notes.length > 50 ? '...' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Warning Section */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl flex gap-4">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-blue-900 mb-1">Why record this?</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Recording your conditions helps our AI Doctor and the Symptom Checker provide more accurate, personalized health guidance tailored to your specific history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
