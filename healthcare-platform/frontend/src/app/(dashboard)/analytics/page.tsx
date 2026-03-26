'use client';

import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, TrendingDown, Thermometer, Heart, AlertCircle, CheckCircle2, Info, ChevronRight, Zap, Droplets, Target } from 'lucide-react';
import apiClient from '@/lib/api';

interface RiskScore {
  name: string;
  score: number;
  status: string;
  recommendations: string[];
}

export default function AnalyticsPage() {
  const [scores, setScores] = useState<RiskScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remedies, setRemedies] = useState<any>(null);
  const [selectedCondition, setSelectedCondition] = useState('General');

  const fetchScores = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/analytics/risk-scores');
      setScores(res.data.scores);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRemedies = async () => {
    try {
       const res = await apiClient.get(`/analytics/preventive-remedies?condition=${selectedCondition}`);
       setRemedies(res.data);
    } catch (error) {
       console.error('Error fetching remedies:', error);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    fetchRemedies();
  }, [selectedCondition]);

  // Simulate real-time continuous biometric ingestion from wearables
  useEffect(() => {
    if (scores.length > 0) {
      const interval = setInterval(() => {
        setScores(prev => prev.map(s => ({
          ...s,
          score: Math.min(100, Math.max(0, s.score + (Math.random() > 0.5 ? 1 : -1)))
        })));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [scores.length]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Activity className="text-primary-700" size={32} /> Predictive Risk Analytics
            </h1>
            <p className="text-slate-500 font-medium">AI-generated health scores based on your history and profile.</p>
          </div>
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Live Wearable Sync</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-[40px]" />)}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Risk Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {scores.map((s, i) => (
                 <div key={i} className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="relative z-10">
                       <h3 className="text-lg font-bold text-slate-900 mb-6">{s.name}</h3>
                       <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-5xl font-black ${
                            s.score < 30 ? 'text-green-500' : s.score < 60 ? 'text-orange-500' : 'text-red-500'
                          }`}>{s.score}%</span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.status}</span>
                       </div>
                       <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-8">
                          <div className={`h-full rounded-full transition-all duration-1000 ${
                            s.score < 30 ? 'bg-green-500' : s.score < 60 ? 'bg-orange-500' : 'bg-red-500'
                          }`} style={{ width: `${s.score}%` }} />
                       </div>
                       <ul className="space-y-3">
                         {s.recommendations.map((rec, j) => (
                           <li key={j} className="flex gap-2 text-xs font-medium text-slate-600">
                             <CheckCircle2 size={14} className="text-primary-700 flex-shrink-0 mt-0.5" /> {rec}
                           </li>
                         ))}
                       </ul>
                    </div>
                    {/* Abstract bg icon */}
                    <div className="absolute -right-6 -top-6 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Heart size={120} fill="currentColor" />
                    </div>
                 </div>
               ))}
            </div>

            {/* Preventive Remedies Section */}
            <div className="bg-slate-900 text-white rounded-[48px] p-10 md:p-16 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                     <div className="w-16 h-16 bg-primary-700 rounded-3xl flex items-center justify-center text-3xl shadow-lg">🛡️</div>
                     <h2 className="text-4xl font-black leading-tight">Preventive Natural Remedies</h2>
                     <p className="text-primary-100 text-lg leading-relaxed">
                       Our AI suggests personalized home remedies and lifestyle shifts to lower your risk scores based on Indian traditional wisdom and modern science.
                     </p>
                     <div className="flex flex-wrap gap-3">
                        {['General', 'Diabetes', 'Hypertension'].map(c => (
                          <button
                            key={c}
                            onClick={() => setSelectedCondition(c)}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${
                              selectedCondition === c ? 'bg-white text-slate-900 border-white shadow-xl' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[40px] p-8 space-y-8">
                     {remedies && (
                       <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                          <div>
                             <h4 className="text-xs font-black uppercase text-primary-500 tracking-widest mb-4">Recommended Remedies</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                                {remedies.remedies.map((r: string, i: number) => (
                                  <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                                     <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold">{i+1}</div>
                                     <span className="font-bold">{r}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div>
                             <h4 className="text-xs font-black uppercase text-primary-500 tracking-widest mb-4">Lifestyle Shifts</h4>
                             <div className="flex flex-wrap gap-3">
                                {remedies.lifestyle.map((l: string, i: number) => (
                                  <span key={i} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-xs font-bold border border-green-500/30">
                                   ✓ {l}
                                  </span>
                                ))}
                             </div>
                          </div>
                       </div>
                     )}
                  </div>
               </div>
               
               {/* Decor */}
               <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary-700 rounded-full blur-[100px] opacity-30"></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
