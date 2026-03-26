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
        
        {/* Hero Section */}
        <div className="relative group w-full">
          <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[32px] md:rounded-[48px] px-8 py-12 md:px-16 md:py-20 text-white overflow-hidden shadow-2xl relative">
            <div className="relative z-10 max-w-3xl flex flex-col gap-5 w-full">
               <p className="text-primary-400 font-black tracking-[0.2em] uppercase text-[10px] md:text-xs">
                 {greeting()},
               </p>
               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white mb-2">
                  Hi, {user?.fullName?.split(' ')[0] || 'Welcome'}!<br className="hidden sm:block" />
                  <span className="text-primary-500"> Ready</span> for your check?
               </h1>
               <p className="text-slate-400 text-sm md:text-base lg:text-lg max-w-lg leading-relaxed font-medium">
                  Your AI health companion is active and monitored. Get personalized guidance in seconds.
               </p>
               <div className="pt-4 flex flex-wrap gap-4">
                  <button onClick={() => router.push('/symptom-checker')} className="bg-primary-700 hover:bg-primary-600 text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-primary-700/20">
                     Start Symptom Check <ChevronRight size={18} />
                  </button>
                  <button onClick={() => router.push('/ai-doc')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 rounded-3xl font-bold flex items-center gap-3 transition-all border border-white/20">
                     Chat with AI Doc
                  </button>
               </div>
            </div>
            
            {/* Visual Decor */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-primary-700/10 blur-[120px] rounded-full translate-x-1/2"></div>
            <div className="absolute top-1/2 right-4 md:right-16 -translate-y-1/2 opacity-[0.05] lg:opacity-20 pointer-events-none">
               <Bot size={250} className="text-primary-500" />
            </div>
          </div>
        </div>

        {/* Status & Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           {/* Sidebar Info */}
           <div className="lg:col-span-1 space-y-8">
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
                 <button onClick={() => router.push('/profile-setup')} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-[24px] font-bold text-sm hover:bg-slate-800 transition-colors">
                    Edit Profile
                 </button>
              </div>

              {/* Conditions & Allergies Quick Access */}
              <div className="grid grid-cols-2 gap-4">
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

           {/* Main Stats Grid */}
           <div className="lg:col-span-3 flex flex-col gap-12">
              
              {/* Active Alerts */}
              <div className="space-y-4">
                 <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest pl-2">Active Alerts</h2>
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

              {/* Latest Checkup */}
              {latestSymptom && (
                <div className="bg-white border border-slate-200 rounded-[40px] p-8 space-y-6">
                   <div className="flex justify-between items-center">
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Latest Symptom Check</h2>
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

              {/* Organized Services Grid */}
              <div className="space-y-12">
                 {serviceGroups.map((group) => (
                    <div key={group.title} className="space-y-6">
                       <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] pl-2">{group.title}</h2>
                       <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                          {group.items.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => router.push(item.href)}
                              className={`${item.color} border rounded-[32px] p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl group flex flex-col items-start justify-between min-h-[140px]`}
                            >
                              <div className="group-hover:scale-110 transition-transform bg-white/50 p-3 rounded-2xl shadow-sm">
                                {item.icon}
                              </div>
                              <div className="w-full flex items-end justify-between">
                                <p className="font-black text-xs lg:text-sm leading-tight uppercase tracking-tight">{item.label}</p>
                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                              </div>
                            </button>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>

           </div>
        </div>

        {/* Info Footer */}
        <div className="bg-slate-100 rounded-[48px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-200">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-4xl shadow-sm">💡</div>
              <div>
                <h4 className="font-black text-xl text-slate-900">Health Tip of the Day</h4>
                <p className="text-slate-500 max-w-lg">Include fiber-rich foods like whole grains, fruits, and vegetables for better digestion and stable energy levels throughout the day.</p>
              </div>
           </div>
           <button onClick={() => router.push('/diseases')} className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold text-sm whitespace-nowrap hover:bg-primary-700 transition-all shadow-xl shadow-slate-900/10">
              Browse Health Library
           </button>
        </div>

    </div>
  );
}
