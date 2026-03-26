'use client';

import { useState, useEffect } from 'react';
import { History, Calendar, Thermometer, MessageSquare, ClipboardList, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api';

interface HistoryItem {
  type: 'symptom_check' | 'appointment';
  id: number;
  title: string;
  subtitle: string;
  date: string;
  status?: string;
  sentiment?: 'high' | 'medium' | 'low';
}

export default function HealthHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'symptom_check' | 'appointment'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const [symptomsRes, appointmentsRes] = await Promise.all([
        apiClient.get('/symptoms/history'),
        apiClient.get('/doctors/appointments')
      ]);

      const symptomItems: HistoryItem[] = symptomsRes.data.map((s: any) => ({
        type: 'symptom_check',
        id: s.id,
        title: s.symptoms_text.substring(0, 40) + (s.symptoms_text.length > 40 ? '...' : ''),
        subtitle: `Duration: ${s.duration || 'N/A'} • Intensity: ${s.intensity}/10`,
        date: s.created_at,
        sentiment: s.analysis_result?.urgency
      }));

      const appointmentItems: HistoryItem[] = appointmentsRes.data.map((a: any) => ({
        type: 'appointment',
        id: a.id,
        title: `Consultation with ${a.doctor_name}`,
        subtitle: `${a.specialty} • ${a.clinic_name}`,
        date: a.appointment_date,
        status: 'Confirmed'
      }));

      const combined = [...symptomItems, ...appointmentItems].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setHistory(combined);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = filter === 'all' ? history : history.filter(h => h.type === filter);

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12 lg:p-16">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Health History</h1>
            <p className="text-neutral-500 font-medium text-lg">Your complete record of consultations and symptom checks.</p>
          </div>
          <div className="flex bg-white rounded-xl p-1 border border-neutral-200">
            {(['all', 'symptom_check', 'appointment'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  filter === f ? 'bg-primary-700 text-white shadow-sm' : 'text-neutral-500 hover:text-primary-700'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-neutral-200 animate-pulse rounded-[32px]" />)}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="card text-center py-20 bg-white space-y-4 border-dashed border-2">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-4xl mx-auto">📋</div>
            <h3 className="text-xl font-bold text-neutral-900">No records found</h3>
            <p className="text-neutral-500 max-w-xs mx-auto text-sm">You haven't performed any symptom checks or booked any appointments yet.</p>
          </div>
        ) : (
          <div className="space-y-4 relative">
             {/* Timeline line */}
             <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-neutral-200 hidden md:block"></div>
                     {filteredHistory.map((h, i) => (
                <div key={`${h.type}-${h.id}`} className="relative pl-0 md:pl-16 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 50}ms` }}>
                  {/* Timeline dot */}
                  <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white shadow-lg z-10 hidden md:block ${
                    h.type === 'symptom_check' ? 'bg-primary-500' : 'bg-green-500'
                  }`}></div>
 
                  <div className="bg-white border border-neutral-200 rounded-[40px] p-8 md:p-10 shadow-sm hover:shadow-xl transition-all flex items-center justify-between group cursor-pointer">
                    <div className="flex gap-8 items-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                        h.type === 'symptom_check' ? 'bg-primary-50 text-primary-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {h.type === 'symptom_check' ? <Thermometer size={32} /> : <Calendar size={32} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
                             {new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {h.sentiment && (
                            <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                              h.sentiment === 'high' ? 'bg-red-50 text-red-600' : 
                              h.sentiment === 'medium' ? 'bg-orange-50 text-orange-600' : 
                              'bg-green-50 text-green-600'
                            }`}>
                              {h.sentiment} Urgency
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-neutral-900 text-xl leading-tight group-hover:text-primary-700 transition-colors tracking-tight">{h.title}</h3>
                        <p className="text-neutral-500 font-medium text-sm mt-1">{h.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                       {h.status && (
                         <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-xl border border-green-200 uppercase tracking-widest">
                           {h.status}
                         </span>
                       )}
                       <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 text-neutral-300 group-hover:text-primary-700 group-hover:border-primary-200 transition-all group-hover:translate-x-1">
                          <ChevronRight size={20} />
                       </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

         {/* Insight Card */}
         <div className="bg-primary-900 text-white p-8 rounded-[40px] relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-4">
               <h4 className="text-2xl font-black">AI Insights Summary</h4>
               <p className="text-primary-100 text-sm leading-relaxed max-w-lg">
                 Based on your history, our AI has noticed a regular pattern in your health checks. Track your data consistently for better long-term health trends.
               </p>
               <button className="bg-white text-primary-900 px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                 Generate Health Report <ClipboardList size={18} />
               </button>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-800 rounded-full blur-[60px] opacity-50"></div>
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-[40px] opacity-30"></div>
         </div>
      </div>
    </div>
  );
}
