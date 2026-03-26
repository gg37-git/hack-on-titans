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
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center font-sans tracking-tight">
      <div className="w-[320px] h-[360px] bg-neutral-900 rounded-[60px] border-4 border-neutral-800 p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden group">
        
        {/* Abstract Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-700/20 rounded-full blur-3xl group-hover:bg-primary-500/30 transition-all duration-1000"></div>

        {/* Top: Status & Battery */}
        <div className="flex justify-between items-center px-4 pt-2">
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Live</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">12:45 PM</span>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto scrollbar-hide">
           {/* Heart Rate */}
           <div className="bg-neutral-800 p-4 rounded-[40px] flex flex-col items-center justify-center gap-1 border border-neutral-700/50 hover:bg-neutral-700/50 transition-colors">
              <Heart className="text-red-500 animate-pulse" size={24} fill="currentColor" />
              <span className="text-2xl font-black transition-all">{vitals.heartRate}</span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">BPM</span>
           </div>
           
           {/* SpO2 */}
           <div className="bg-neutral-800 p-4 rounded-[40px] flex flex-col items-center justify-center gap-1 border border-neutral-700/50 hover:bg-neutral-700/50 transition-colors">
              <Droplets className="text-cyan-400" size={24} />
              <span className="text-2xl font-black text-cyan-50 transition-all">{vitals.spo2}%</span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">SpO2</span>
           </div>

           {/* Steps */}
           <div className="bg-neutral-800 p-4 rounded-[40px] flex flex-col items-center justify-center gap-1 border border-neutral-700/50 hover:bg-neutral-700/50 transition-colors">
              <Activity className="text-primary-500" size={24} />
              <span className="text-xl font-black transition-all">{vitals.steps.toLocaleString()}</span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Steps</span>
           </div>

           {/* HRV */}
           <div className="bg-neutral-800 p-4 rounded-[40px] flex flex-col items-center justify-center gap-1 border border-neutral-700/50 hover:bg-neutral-700/50 transition-colors">
              <Activity className="text-purple-400" size={24} />
              <span className="text-2xl font-black text-purple-50 transition-all">{vitals.hrv}</span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">HRV (ms)</span>
           </div>

           {/* Active Alert */}
           {alerts.length > 0 ? (
             <div className="col-span-2 bg-primary-900 border border-primary-700 p-4 rounded-[40px] flex items-center gap-4 animate-in slide-in-from-bottom-4">
                <div className="w-10 h-10 bg-primary-700 rounded-2xl flex items-center justify-center">
                   <Bell size={20} className="animate-wiggle text-white" />
                </div>
                <div className="flex-1">
                   <p className="text-[9px] font-black uppercase text-primary-400 tracking-widest">Alert</p>
                   <p className="text-xs font-bold leading-tight line-clamp-1">{alerts[0].title}</p>
                </div>
                <ChevronRight size={16} className="text-primary-400" />
             </div>
           ) : (
             <div className="col-span-2 bg-neutral-800 border border-neutral-700 p-4 rounded-[40px] flex items-center justify-center gap-2 opacity-50 italic text-[10px] font-bold">
                <CheckCircle2 size={14} /> All clear today
             </div>
           )}

           {/* Quick Actions */}
           <div className="col-span-2 grid grid-cols-2 gap-3 mt-1">
              <button className="bg-neutral-800 h-12 rounded-3xl flex items-center justify-center text-primary-500 border border-neutral-700/50 active:scale-95 transition-all">
                 <Thermometer size={20} />
              </button>
              <button className="bg-neutral-800 h-12 rounded-3xl flex items-center justify-center text-red-500 border border-neutral-700/50 active:scale-95 transition-all">
                 <ShieldAlert size={20} />
              </button>
           </div>
        </div>

        {/* Bottom indicator */}
        <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mt-2"></div>
      </div>

      <div className="mt-8 text-center space-y-4 max-w-xs">
         <div className="flex items-center gap-2 justify-center text-primary-700">
            <Watch size={20} />
            <h2 className="text-sm font-black uppercase tracking-widest">Wearable Sync Active</h2>
         </div>
         <p className="text-xs text-neutral-500 font-medium leading-relaxed">
            This simplified mode is optimized for smartwatches, fitness trackers, and smart glasses.
         </p>
      </div>
    </div>
  );
}
