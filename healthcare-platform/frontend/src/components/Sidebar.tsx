'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Stethoscope, Bot, Users, History, 
  BookOpen, Bell, Heart, Apple, Brain, Activity, 
  ShieldCheck, UserCircle, LogOut, Watch, Calendar, Globe, Loader2, X, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

const menuGroups = [
  {
    title: 'Clinical Care',
    items: [
      { icon: <Users size={20} />, label: 'Find Doctors', href: '/doctors' },
      { icon: <History size={20} />, label: 'Health History', href: '/health-history' },
      { icon: <Calendar size={20} />, label: 'Appointments', href: '/doctors' },
    ]
  },
  {
    title: 'AI Wellness',
    items: [
      { icon: <Stethoscope size={20} />, label: 'Symptom Checker', href: '/symptom-checker' },
      { icon: <Bot size={20} />, label: 'AI Doctor', href: '/ai-doc' },
      { icon: <Apple size={20} />, label: 'Nutrition Coach', href: '/nutrition' },
      { icon: <Brain size={20} />, label: 'Mental Health', href: '/mental-health' },
      { icon: <Activity className="text-pink-600" size={20} />, label: 'Fertility Tracking', href: '/fertility' },
    ]
  },
  {
    title: 'Insights & Tools',
    items: [
      { icon: <Bell size={20} />, label: 'Medical Alerts', href: '/alerts', isPremium: false },
      { icon: <BookOpen size={20} />, label: 'Disease Library', href: '/diseases', isPremium: false },
    ]
  },
  {
    title: 'Advanced Features (Now Free)',
    items: [
      { icon: <Activity size={20} />, label: 'Risk Analytics', href: '/analytics', isPremium: false },
      { icon: <Watch size={20} />, label: 'Wearable Mode', href: '/wearable', isPremium: false },
    ]
  },
  {
    title: 'Device & Account',
    items: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/dashboard', isPremium: false },
      { icon: <UserCircle size={20} />, label: 'Profile Setup', href: '/profile-setup', isPremium: false },
    ]
  },

];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  
  const handleSidebarUpgrade = () => {
     router.push('/checkout');
  };

  return (
    <aside className="w-72 bg-white border-r border-neutral-200 h-screen sticky top-0 hidden lg:flex flex-col shadow-sm">
      <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Heart size={22} fill="white" />
          </div>
          <span className="text-xl font-black text-neutral-900 tracking-tight">HealthCare<span className="text-primary-700">.</span></span>
        </div>
      </div>

      <div className="px-6 pt-6 pb-2">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-xl pl-9 pr-3 py-2 appearance-none outline-none focus:border-primary-500"
          >
            <option value="en">English (US)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-hide">
        {menuGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <h3 className="text-[10px] uppercase font-black text-neutral-400 tracking-widest pl-3">{t(group.title)}</h3>
            <div className="flex flex-col gap-1">
              {group.items.map((item: any) => {
                const isLocked = item.isPremium && !user?.isPremium;
                return (
                  <Link
                    key={item.label}
                    href={isLocked ? '/checkout' : item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
                      pathname === item.href && !isLocked
                      ? 'bg-primary-700 text-white shadow-md shadow-primary-700/20' 
                      : isLocked ? 'bg-amber-50/50 text-amber-700/70 hover:bg-amber-100 hover:text-amber-900 border border-amber-100/50' : 'text-neutral-500 hover:bg-neutral-50 hover:text-primary-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${pathname === item.href && !isLocked ? 'text-white' : isLocked ? 'text-amber-500' : 'text-neutral-400 group-hover:text-primary-700'} transition-colors`}>
                        {item.icon}
                      </span>
                      {t(item.label)}
                    </div>
                    {isLocked && <ShieldCheck size={16} className="text-amber-500" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Permanent Premium Wellness Upgrade Banner - Hardcoded to ALWAYS be visible globally */}
        <div className="mt-8 bg-black text-white rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden group">
           <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="text-primary-400" size={18} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">{t('Premium Wellness')}</span>
              </div>
              <p className="text-xs font-bold leading-relaxed">{t('Get AI Risk Scores & Indian Diet Plans.')}</p>
              <button 
                onClick={handleSidebarUpgrade}
                className="w-full h-10 flex items-center justify-center bg-white text-black rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-primary-500 hover:text-white transition-all cursor-pointer relative z-20"
              >
                {t('Upgrade Now')}
              </button>
           </div>
           <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-700/20 rounded-full blur-2xl group-hover:bg-primary-500/30 transition-all duration-1000 pointer-events-none"></div>
        </div>
      </nav>

      <div className="p-6 border-t border-neutral-50 bg-neutral-50/50">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} /> {t('Logout')}
        </button>
      </div>
    </aside>
  );
}
