'use client';

import { useState, useEffect } from 'react';
import { Watch, Heart, Bell, ChevronRight, Activity, Thermometer, ShieldAlert, CheckCircle2, Droplets } from 'lucide-react';
import apiClient from '@/lib/api';

export default function WearablePage() {
  const [vitals, setVitals] = useState({
    heartRate: 72,
    steps: 8432,
    spo2: 98,
    hrv: 45
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        heartRate: Math.max(60, Math.min(120, prev.heartRate + Math.floor(Math.random() * 5) - 2)),
        steps: prev.steps + Math.floor(Math.random() * 3),
        spo2: Math.min(100, Math.max(95, prev.spo2 + Math.floor(Math.random() * 3) - 1)),
        hrv: Math.max(30, prev.hrv + Math.floor(Math.random() * 5) - 2)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [alerts, setAlerts] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await apiClient.get('/alerts');
        setAlerts(res.data.filter((a: any) => a.is_active)); // eslint-disable-line @typescript-eslint/no-explicit-any
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-6 flex flex-col items-center justify-center font-sans tracking-tight animate-in fade-in duration-500">
      
      {/* Premium Light Watch Frame */}
      <div className="w-[340px] h-fit bg-white rounded-[70px] border-[12px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] p-6 flex flex-col gap-6 relative overflow-hidden group">
        
        {/* Abstract Mesh Background (Subtle) */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-100 rounded-full blur-[80px] group-hover:bg-primary-200 transition-all duration-1000 opacity-60"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-50 rounded-full blur-[60px] opacity-60"></div>

        {/* Top: Status & Battery */}
        <div className="relative z-10 flex justify-between items-center px-4 pt-2">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Sync</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">12:45 PM</span>
        </div>

        {/* Vitals Grid (Glassmorphism & Light Shadows) */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
           {/* Heart Rate */}
           <div className="bg-slate-50/80 backdrop-blur-sm p-5 rounded-[40px] flex flex-col items-center justify-center gap-2 border border-white shadow-sm hover:bg-white hover:shadow-md transition-all duration-300">
              <Heart className="text-red-500 animate-pulse" size={28} fill="currentColor" />
              <div className="flex flex-col items-center">
                 <span className="text-3xl font-black text-slate-900 tabular-nums">{vitals.heartRate}</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BPM</span>
              </div>
           </div>
           
           {/* SpO2 */}
           <div className="bg-slate-50/80 backdrop-blur-sm p-5 rounded-[40px] flex flex-col items-center justify-center gap-2 border border-white shadow-sm hover:bg-white hover:shadow-md transition-all duration-300">
              <Droplets className="text-primary-600" size={28} />
              <div className="flex flex-col items-center">
                 <span className="text-3xl font-black text-slate-900 tabular-nums">{vitals.spo2}%</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SpO2</span>
              </div>
           </div>
 
           {/* Steps */}
           <div className="bg-slate-50/80 backdrop-blur-sm p-5 rounded-[40px] flex flex-col items-center justify-center gap-2 border border-white shadow-sm hover:bg-white hover:shadow-md transition-all duration-300">
              <Activity className="text-indigo-600" size={28} />
              <div className="flex flex-col items-center">
                 <span className="text-2xl font-black text-slate-900 tabular-nums">{vitals.steps.toLocaleString()}</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Steps</span>
              </div>
           </div>
 
           {/* HRV */}
           <div className="bg-slate-50/80 backdrop-blur-sm p-5 rounded-[40px] flex flex-col items-center justify-center gap-2 border border-white shadow-sm hover:bg-white hover:shadow-md transition-all duration-300">
              <Activity className="text-primary-500" size={28} />
              <div className="flex flex-col items-center">
                 <span className="text-3xl font-black text-slate-900 tabular-nums">{vitals.hrv}</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ms (HRV)</span>
              </div>
           </div>
 
           {/* Active Alert (Light Version) */}
           {alerts.length > 0 ? (
             <div className="col-span-2 bg-primary-700 text-white p-5 rounded-[40px] flex items-center gap-4 animate-in slide-in-from-bottom-4 shadow-xl shadow-primary-200">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <Bell size={24} className="animate-wiggle text-white" />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase text-primary-200 tracking-widest">Active Alert</p>
                   <p className="text-sm font-bold leading-tight line-clamp-1">{alerts[0].title}</p>
                </div>
                <ChevronRight size={18} className="text-primary-200" />
             </div>
           ) : (
             <div className="col-span-2 bg-slate-50/50 border border-slate-100 p-5 rounded-[40px] flex items-center justify-center gap-2 text-slate-400 italic text-[11px] font-bold">
                <CheckCircle2 size={16} className="text-green-500" /> All systems normal
             </div>
           )}
 
           {/* Quick Actions (Light Mode) */}
           <div className="col-span-2 grid grid-cols-2 gap-4 mt-2">
              <button className="bg-white h-14 rounded-3xl flex items-center justify-center text-primary-600 shadow-sm border border-slate-100 hover:bg-primary-50 hover:border-primary-100 active:scale-95 transition-all">
                 <Thermometer size={24} />
              </button>
              <button className="bg-white h-14 rounded-3xl flex items-center justify-center text-red-500 shadow-sm border border-slate-100 hover:bg-red-50 hover:border-red-100 active:scale-95 transition-all">
                 <ShieldAlert size={24} />
              </button>
           </div>
        </div>
 
        {/* Bottom indicator */}
        <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mt-2"></div>
      </div>
 
      <div className="mt-12 text-center space-y-4 max-w-sm">
         <div className="flex items-center gap-3 justify-center text-primary-700 bg-primary-50 px-6 py-3 rounded-full w-fit mx-auto border border-primary-100">
            <Watch size={20} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Wearable Sync Active</h2>
         </div>
         <p className="text-sm text-slate-500 font-medium leading-relaxed px-6">
            Light Mode optimized for high-visibility environments. All metrics are synced via encrypted clinical protocols.
         </p>
      </div>
    </div>
  );
}
