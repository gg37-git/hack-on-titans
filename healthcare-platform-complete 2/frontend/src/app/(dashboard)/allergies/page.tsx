'use client';

import { useState, useEffect } from 'react';
import { Plus, X, AlertTriangle, Info, Check, ShieldAlert } from 'lucide-react';
import apiClient from '@/lib/api';

interface Allergy {
  id: number;
  allergy_name: string;
  severity: string;
  reaction_description: string;
  medical_action_required: boolean;
}

export default function AllergiesPage() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAllergy, setNewAllergy] = useState({
    allergy_name: '',
    severity: 'mild',
    reaction_description: '',
    medical_action_required: false
  });

  const fetchAllergies = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/allergies');
      setAllergies(res.data);
    } catch (error) {
      console.error('Error fetching allergies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await apiClient.get('/allergies/options');
      setOptions(res.data.allergens);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    fetchAllergies();
    fetchOptions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergy.allergy_name) return;
    try {
      const res = await apiClient.post('/allergies', newAllergy);
      setAllergies([res.data, ...allergies]);
      setNewAllergy({ allergy_name: '', severity: 'mild', reaction_description: '', medical_action_required: false });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding allergy:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/allergies/${id}`);
      setAllergies(allergies.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting allergy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Known Allergies</h1>
            <p className="text-neutral-500">Manage your allergies and triggers for better safety.</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} /> Add Allergy
            </button>
          )}
        </div>

        {isAdding && (
          <div className="card animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4">Add New Allergy</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Allergen</label>
                  <select
                    value={newAllergy.allergy_name}
                    onChange={(e) => setNewAllergy({ ...newAllergy, allergy_name: e.target.value })}
                    className="input-field h-12"
                    required
                  >
                    <option value="">Select an allergen...</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                    <option value="Other">Other (Type in description)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Severity</label>
                  <select
                    value={newAllergy.severity}
                    onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                    className="input-field h-12"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe / Anaphylactic</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1.5">Reaction Description (Optional)</label>
                <textarea
                  value={newAllergy.reaction_description}
                  onChange={(e) => setNewAllergy({ ...newAllergy, reaction_description: e.target.value })}
                  placeholder="E.g. Hives, throat swelling, itching..."
                  className="input-field min-h-[100px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={newAllergy.medical_action_required}
                  onChange={(e) => setNewAllergy({ ...newAllergy, medical_action_required: e.target.checked })}
                  className="w-5 h-5 accent-primary-700"
                />
                <label htmlFor="urgent" className="text-sm font-semibold text-neutral-900">Requires immediate medical action if exposed</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Allergy</button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-neutral-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : allergies.length === 0 ? (
          <div className="card text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-3xl mx-auto">🥜</div>
            <p className="text-neutral-500">No allergies recorded yet.</p>
            <button onClick={() => setIsAdding(true)} className="text-primary-700 font-bold hover:underline">Add your first allergy</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {allergies.map((a) => (
              <div key={a.id} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    a.severity === 'severe' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                      {a.allergy_name}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        a.severity === 'severe' ? 'bg-red-100 text-red-700' : 
                        a.severity === 'moderate' ? 'bg-orange-100 text-orange-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {a.severity}
                      </span>
                    </h3>
                    <div className="flex flex-col gap-1 mt-1 text-sm text-neutral-500">
                      {a.reaction_description && (
                        <p className="flex items-center gap-1">Reaction: {a.reaction_description}</p>
                      )}
                      {a.medical_action_required && (
                        <p className="text-red-600 font-bold flex items-center gap-1 animate-pulse">
                          <ShieldAlert size={14} /> Medical Action Required on Exposure
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(a.id)}
                  className="p-2 text-neutral-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-3xl flex gap-4">
          <Info className="text-orange-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-orange-900 mb-1">Safety First</h4>
            <p className="text-sm text-orange-700 leading-relaxed">
              Recording your allergies allows the AI to provide warnings when suggesting treatments or diet plans, ensuring your safety at all times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
