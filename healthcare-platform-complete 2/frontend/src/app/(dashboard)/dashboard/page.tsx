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
import { useHealthScore } from '@/hooks/useHealthScore';
import HealthScoreChart from '@/components/HealthScoreChart';
import LogHealthForm from '@/components/LogHealthForm';

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
      { icon: <Activity className="text-rose-600" size={24} />, label: 'Allergy Reaction Risk', href: '/allergy-check', color: 'bg-rose-50 text-rose-700 border-rose-100' },
    ]
  },
  {
    title: 'Monitoring & Risk',
    items: [
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
  const { weeklyScores, loading: scoresLoading, seedMockData, fetchWeeklyScores } = useHealthScore(user?.id);
  const [showLogModal, setShowLogModal] = useState(false);

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
        
        {/* Premium Light-Theme Hero Banner (Mesh Gradient & Glassmorphism) */}
        <div className="w-full">
          <div className="relative bg-white rounded-[32px] md:rounded-[40px] px-8 py-10 md:px-12 md:py-14 text-slate-900 overflow-hidden shadow-sm border border-slate-200 group">
            
            {/* Soft Mesh Blobs (Light Theme) */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/40 blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/50 blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
            
            {/* Subtle Overlay for texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 via-transparent to-white z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center gap-10">
               <div className="flex flex-col items-center gap-5 max-w-3xl">
                  <div className="flex items-center gap-3">
                     <span className="w-10 h-[2px] bg-primary-200 rounded-full"></span>
                     <p className="text-primary-600 font-bold tracking-[0.4em] uppercase text-[10px] sm:text-xs">
                        {greeting()}
                     </p>
                     <span className="w-10 h-[2px] bg-primary-200 rounded-full"></span>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl lg:text-7xl font-black leading-[1] tracking-tighter text-slate-900">
                     Hi, {user?.fullName?.split(' ')[0] || 'User'}! <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 opacity-90">Ready for your health check?</span>
                  </h1>
                  
                  <p className="text-slate-500 text-sm md:text-xl font-medium max-w-2xl leading-relaxed">
                     Experience the next generation of AI healthcare. <br className="hidden md:block"/> Our clinical intelligence is active and ready to assist you.
                  </p>
               </div>
               
               <div className="relative z-10 flex flex-wrap justify-center gap-6 shrink-0 items-center">
                  <button 
                    onClick={() => router.push('/symptom-checker')} 
                    className="bg-primary-700 text-white px-10 py-5 rounded-[24px] font-black text-sm md:text-lg flex items-center gap-3 hover:bg-primary-800 transition-all shadow-xl shadow-primary-200 active:scale-95 group/btn"
                  >
                     Initiate Body Scan 
                     <ChevronRight size={22} className="translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => router.push('/ai-doc')} 
                    className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-10 py-5 rounded-[24px] font-black text-sm md:text-lg transition-all shadow-sm"
                  >
                     Talk to AI Doctor
                  </button>
               </div>
            </div>
            
            {/* Subtle Decorative Icon */}
            <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none scale-150">
               <Bot size={280} className="text-primary-900" strokeWidth={1} />
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

               {/* Conditions & Allergies Quick Access (Balanced) */}
               <div className="grid grid-cols-1 gap-3">
                 <button onClick={() => router.push('/medical-conditions')} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-primary-700 transition-all group shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="text-xl">🩺</div>
                       <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Conditions</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-700" />
                 </button>
                  <button onClick={() => router.push('/allergies')} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-primary-700 transition-all group shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="text-xl">🥜</div>
                       <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Allergies</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-700" />
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
               
               {/* Weekly Health Score Chart (NEW) */}
                <div className="space-y-6">
                   <div className="flex justify-between items-center pr-4">
                     <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] pl-2">Health Analytics</h2>
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setShowLogModal(true)}
                          className="bg-primary-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-800 transition-all shadow-lg shadow-primary-200"
                        >
                           Log Today's Vitals
                        </button>
                        <button 
                          onClick={seedMockData}
                          className="text-[10px] font-black text-slate-300 uppercase hover:text-primary-600 transition-colors"
                        >
                          (Dev: Seed Data)
                        </button>
                     </div>
                   </div>
                   <HealthScoreChart data={weeklyScores} loading={scoresLoading} />
                </div>

                {showLogModal && (
                  <LogHealthForm 
                    onClose={() => setShowLogModal(false)} 
                    onSuccess={fetchWeeklyScores} 
                  />
                )}

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

               <div className="space-y-12">
                  {serviceGroups.map((group) => (
                     <div key={group.title} className="space-y-6">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                           <span className="w-8 h-[1px] bg-slate-200"></span>
                           {group.title}
                           <span className="w-8 h-[1px] bg-slate-200"></span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                           {group.items.map((item) => (
                             <button
                               key={item.label}
                               onClick={() => router.push(item.href)}
                               className={`${item.color} border border-slate-200 rounded-3xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 group flex flex-col items-center justify-center gap-4 min-h-[180px] relative overflow-hidden`}
                             >
                               <div className="relative z-10 bg-white shadow-md p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                 {item.icon}
                               </div>
                               <div className="flex flex-col items-center gap-2 relative z-10">
                                 <p className="font-black text-sm tracking-tight text-slate-900">{item.label}</p>
                                 <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-primary-700 group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
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
