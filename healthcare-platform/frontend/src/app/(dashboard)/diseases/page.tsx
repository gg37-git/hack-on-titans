'use client';

import { useState, useEffect } from 'react';
import { Search, Info, ChevronRight, X, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api';

interface Disease {
  id: number;
  name: string;
  category: string;
  overview: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  urgency: string;
  emoji: string;
}

export default function DiseaseLibraryPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiseases = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/diseases', {
        params: { search, category: selectedCategory }
      });
      setDiseases(res.data.diseases);
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Error fetching diseases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Disease Library</h1>
          <p className="text-neutral-500">Comprehensive educational resources on common health conditions.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search by disease name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 h-10 shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                selectedCategory === '' ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-700'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  selectedCategory === c ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Disease Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-neutral-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diseases.map((d) => (
              <div 
                key={d.id} 
                onClick={() => setSelectedDisease(d)}
                className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{d.emoji}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      d.urgency === 'high' ? 'bg-red-50 text-red-600' : 
                      d.urgency === 'medium' ? 'bg-orange-50 text-orange-600' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {d.urgency} Urgency
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-700 mb-1">{d.name}</h3>
                  <p className="text-xs text-primary-700 font-medium mb-3">{d.category}</p>
                  <p className="text-neutral-500 text-sm line-clamp-2 leading-relaxed">{d.overview}</p>
                </div>
                <div className="mt-4 flex items-center text-primary-700 text-xs font-bold gap-1 group-hover:gap-2 transition-all">
                  Read Details <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedDisease && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl animate-in zoom-in-95 scrollbar-hide">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedDisease.emoji}</div>
                  <div>
                    <h2 className="text-3xl font-black text-neutral-900">{selectedDisease.name}</h2>
                    <p className="text-primary-700 font-bold uppercase tracking-widest text-[10px]">{selectedDisease.category}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDisease(null)} className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-neutral-900 text-lg mb-3 flex items-center gap-2">
                    <Info size={18} className="text-primary-700" /> Overview
                  </h4>
                  <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    {selectedDisease.overview}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-3 text-base">⚠️ Common Symptoms</h4>
                    <ul className="space-y-2">
                      {selectedDisease.symptoms.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-neutral-600">
                           <span className="text-primary-700 font-black">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-3 text-base">🧪 Causes & Triggers</h4>
                    <ul className="space-y-2">
                      {selectedDisease.causes.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-neutral-600">
                           <span className="text-primary-700 font-black">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-neutral-100">
                   <div>
                    <h4 className="font-bold text-neutral-900 mb-3 text-base">💊 Treatment & Management</h4>
                    <ul className="space-y-2">
                      {selectedDisease.treatment.map((t, i) => (
                        <li key={i} className="flex gap-2 text-sm text-neutral-600">
                           <span className="bg-green-100 text-green-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">✓</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-3 text-base">🛡️ Prevention Tips</h4>
                    <ul className="space-y-2">
                      {selectedDisease.prevention.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-neutral-600">
                           <span className="bg-blue-100 text-blue-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">★</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl flex gap-3 border ${
                  selectedDisease.urgency === 'high' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                }`}>
                   <AlertCircle size={24} className={selectedDisease.urgency === 'high' ? 'text-red-600' : 'text-blue-600'} />
                   <p className={`text-xs font-medium leading-relaxed ${
                     selectedDisease.urgency === 'high' ? 'text-red-700' : 'text-blue-700'
                   }`}>
                     <strong>Medical Advice:</strong> This information is for education. {selectedDisease.urgency === 'high' ? 'These symptoms require immediate attention.' : 'Always consult a healthcare provider for any health concern.'}
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
