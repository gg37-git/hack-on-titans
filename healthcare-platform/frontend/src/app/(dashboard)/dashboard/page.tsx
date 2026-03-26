'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Stethoscope, Bot, Users, History, BookOpen, 
  Bell, Heart, ChevronRight, 
  LogOut, UserCircle, Thermometer, AlertCircle, CheckCircle2,
  Apple, Brain, Activity, Watch, ShieldCheck, Calendar
} from 'lucide-react';
import apiClient from '@/lib/api';

const serviceGroups = [
  {
    title: 'Clinical Care',
    items: [
      { icon: <Users size={24} />, label: 'Find Doctors', href: '/doctors', color: 'bg-blue-50 text-blue-700 border-blue-100' },
      { icon: <Calendar size={24} />, label: 'Appointments', href: '/doctors', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
      { icon: <History size={24} />, label: 'Health History', href: '/health-history', color: 'bg-slate-50 text-slate-700 border-slate-100' },
    ]
  },
  {
    title: 'AI Health Engine',
    items: [
      { icon: <Thermometer size={24} />, label: 'Symptom Checker', href: '/symptom-checker', color: 'bg-rose-50 text-rose-700 border-rose-100' },
      { icon: <Bot size={24} />, label: 'AI Doctor Chat', href: '/ai-doc', color: 'bg-purple-50 text-purple-700 border-purple-100' },
      { icon: <Apple size={24} />, label: 'Nutrition Coach', href: '/nutrition', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      { icon: <Brain size={24} />, label: 'Mental Health', href: '/mental-health', color: 'bg-orange-50 text-orange-700 border-orange-100' },
    ]
  },
  {
    title: 'Monitoring & Risk',
    items: [
      { icon: <Activity size={24} />, label: 'Risk Analytics', href: '/analytics', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
      { icon: <Activity className="text-pink-600" size={24} />, label: 'Fertility Tracking', href: '/fertility', color: 'bg-pink-50 text-pink-700 border-pink-100' },
      { icon: <Watch size={24} />, label: 'Wearable Mode', href: '/wearable', color: 'bg-slate-900 text-white border-slate-800' },
      { icon: <Bell size={24} />, label: 'Medical Alerts', href: '/alerts', color: 'bg-red-50 text-red-700 border-red-100' },
    ]
  }
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [latestSymptom, setLatestSymptom] = useState<any>(null);
  const [completion, setCompletion] = useState(0);

  const fetchData = async () => {
    try {
      const [profileRes, alertsRes, symptomsRes] = await Promise.all([
        apiClient.get('/profile'),
        apiClient.get('/alerts'),
        apiClient.get('/symptoms/history')
      ]);

      setProfile(profileRes.data);
      setAlerts(alertsRes.data.filter((a: any) => a.is_active));
      if (symptomsRes.data.length > 0) setLatestSymptom(symptomsRes.data[0]);

      // Calculate completion
      let count = 0;
      const p = profileRes.data;
      if (p.date_of_birth) count += 20;
      if (p.gender) count += 20;
      if (p.height_cm) count += 20;
      if (p.weight_kg) count += 20;
      if (p.blood_group) count += 20;
      setCompletion(count);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col gap-10 md:gap-16 pt-2 animate-in fade-in duration-500">
        
        {/* Streamlined Hero Banner (Upscaled) */}
        <div className="w-full">
          <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-[32px] md:rounded-[40px] px-8 py-10 md:px-12 md:py-14 text-white overflow-hidden shadow-xl shadow-primary-900/10 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="relative z-10 flex flex-col gap-3">
               <p className="text-primary-100 font-black tracking-[0.25em] uppercase text-[11px] md:text-xs">
                 {greeting()}
               </p>
               <h1 className="text-4xl md:text-5xl lg:text-5xl font-black leading-tight tracking-tight text-white max-w-xl">
                  Hello, {user?.fullName?.split(' ')[0] || 'User'}! Ready for a checkup?
               </h1>
            </div>
            
            <div className="relative z-10 flex gap-4 shrink-0">
               <button onClick={() => router.push('/symptom-checker')} className="bg-white text-primary-700 px-8 py-4 rounded-[20px] font-black text-sm md:text-base flex items-center gap-2 hover:bg-neutral-50 transition-all shadow-lg active:scale-95">
                  Initiate Scan <ChevronRight size={18} />
               </button>
               <button onClick={() => router.push('/ai-doc')} className="bg-transparent text-white border-2 border-white/20 hover:bg-white/10 px-8 py-4 rounded-[20px] font-black text-sm md:text-base transition-all focus:ring-2">
                  Connect AI
               </button>
            </div>
            
            {/* Visual Decor */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none translate-x-[20%]">
               <Heart size={200} className="text-white" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Status & Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
           
           {/* Sidebar Info (De-clumped) */}
           <div className="lg:col-span-1 space-y-12">
              {/* Profile Card */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                 <h3 className="font-bold text-slate-900 mb-6 flex justify-between items-center">
                    Health Profile
                    <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{completion}% Complete</span>
                 </h3>
                 <div className="w-full bg-slate-100 rounded-full h-3 mb-8 overflow-hidden">
                    <div className="bg-primary-700 h-full rounded-full transition-all duration-1000" style={{ width: `${completion}%` }} />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                       <span className="text-slate-500">Blood Group</span>
                       <span className="font-bold text-slate-900">{profile?.blood_group || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                       <span className="text-slate-500">Weight</span>
                       <span className="font-bold text-slate-900">{profile?.weight_kg ? `${profile.weight_kg} kg` : '—'}</span>
                    </div>
                 </div>
                  <button onClick={() => router.push('/profile-setup')} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
                    Manage Profile
                  </button>
               </div>

               {/* Conditions & Allergies Quick Access (Expanded) */}
               <div className="grid grid-cols-2 gap-6">
                 <button onClick={() => router.push('/medical-conditions')} className="bg-white border border-slate-200 rounded-[32px] p-6 text-center hover:border-primary-700 transition-all group">
                    <div className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all">🩺</div>
                    <p className="text-[10px] uppercase font-black text-slate-400 group-hover:text-primary-700">Conditions</p>
                 </button>
                  <button onClick={() => router.push('/allergies')} className="bg-white border border-slate-200 rounded-[32px] p-6 text-center hover:border-primary-700 transition-all group">
                    <div className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all">🥜</div>
                    <p className="text-[10px] uppercase font-black text-slate-400 group-hover:text-primary-700">Allergies</p>
                 </button>
              </div>
           </div>

           {/* Main Stats Grid (De-clumped) */}
           <div className="lg:col-span-3 flex flex-col gap-16 md:gap-24">
                            {/* Active Alerts (De-clumped) */}
               <div className="space-y-6 pb-6">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] pl-2">Active Alerts</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alerts.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-[32px] p-8 flex items-center justify-center gap-4 text-slate-400 italic text-sm md:col-span-2 border-dashed">
                        No active alerts. Add medication reminders in the Alerts section.
                      </div>
                    ) : (
                      alerts.slice(0, 2).map((a) => (
                        <div key={a.id} className="bg-white border border-slate-200 rounded-[32px] p-6 flex items-center justify-between group hover:border-red-200 transition-all">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                a.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                              }`}>
                                <Bell size={24} className="animate-wiggle" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-900">{a.title}</h4>
                                 <p className="text-xs text-slate-500">{new Date(a.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {a.severity}</p>
                              </div>
                           </div>
                           <ChevronRight className="text-slate-300 group-hover:text-red-500 transition-all" size={20} />
                        </div>
                      ))
                    )}
                 </div>
              </div>

               {/* Latest Checkup (Expanded) */}
               {latestSymptom && (
                 <div className="bg-white border border-slate-200 rounded-[40px] p-10 space-y-8 shadow-sm">
                    <div className="flex justify-between items-center">
                       <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Latest Insight</h2>
                      <span className="text-xs font-bold text-slate-400">{new Date(latestSymptom.created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="bg-slate-50 rounded-[32px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-1">
                         <p className="font-bold text-lg text-slate-900">"{latestSymptom.symptoms_text}"</p>
                         <p className="text-sm text-slate-500">Analysis: {latestSymptom.analysis_result?.possible_conditions?.[0] || 'Unknown'}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl text-sm font-black uppercase ${
                        latestSymptom.analysis_result?.urgency === 'high' ? 'bg-red-100 text-red-700' : 
                        latestSymptom.analysis_result?.urgency === 'medium' ? 'bg-orange-100 text-orange-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {latestSymptom.analysis_result?.urgency} Urgency
                      </div>
                   </div>
                </div>
              )}

              {/* Organized Services Grid (De-clumped) */}
              <div className="space-y-16 md:space-y-24">
                 {serviceGroups.map((group) => (
                    <div key={group.title} className="space-y-8">
                       <h2 className="text-base font-black text-slate-800 tracking-[-0.02em] pl-2 border-l-4 border-primary-500 rounded-sm italic">{group.title}</h2>
                       <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-10">
                          {group.items.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => router.push(item.href)}
                              className={`${item.color} border-2 rounded-[40px] p-6 md:p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-${item.color.split('-')[1]}-500/20 group flex flex-col items-start justify-between min-h-[160px] md:min-h-[180px] relative overflow-hidden`}
                            >
                              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/40 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                              <div className="relative z-10 group-hover:scale-110 transition-transform duration-500 bg-white shadow-sm p-4 rounded-3xl mb-4">
                                {item.icon}
                              </div>
                              <div className="w-full flex items-center justify-between relative z-10">
                                <p className="font-black text-sm md:text-base leading-tight tracking-tight">{item.label}</p>
                                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 backdrop-blur-md">
                                  <ChevronRight size={16} />
                                </div>
                              </div>
                            </button>
                          ))}
                       </div>
                    </div>
                  ))}
              </div>
              
              <div className="h-20"></div> {/* Bottom Buffer for Spacing */}
           </div>
        </div>
    </div>
  );
}
