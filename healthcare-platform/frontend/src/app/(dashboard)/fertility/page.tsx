'use client';

import { useState } from 'react';
import { Calendar, Droplet, Activity, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function FertilityTracking() {
  const { t } = useLanguage();
  const [lastPeriod, setLastPeriod] = useState<string>('');
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [prediction, setPrediction] = useState<{next: Date, ovulation: Date} | null>(null);

  const calculateCycle = () => {
    if (!lastPeriod) return;
    const start = new Date(lastPeriod);
    const nextText = new Date(start);
    nextText.setDate(nextText.getDate() + cycleLength);
    
    // Ovulation is roughly 14 days before the next period
    const ovu = new Date(nextText);
    ovu.setDate(ovu.getDate() - 14);

    setPrediction({ next: nextText, ovulation: ovu });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 flex items-center gap-3">
             <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
               <Droplet size={24} className="fill-pink-600" />
             </div>
             {t('Cycle & Fertility Tracking')}
          </h1>
          <p className="text-neutral-500 mt-2">{t('Log your menstrual cycle to calculate your upcoming periods and fertile windows.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
              {t('Log Cycle')}
              <Calendar size={20} className="text-pink-600" />
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">{t('First day of last period')}</label>
                <input 
                  type="date" 
                  value={lastPeriod}
                  onChange={e => setLastPeriod(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">{t('Average Cycle Length (days)')}</label>
                <input 
                  type="number" 
                  value={cycleLength}
                  min={20} max={45}
                  onChange={e => setCycleLength(parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
              <button 
                onClick={calculateCycle}
                disabled={!lastPeriod}
                className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {t('Calculate Predictions')} <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-3xl border border-pink-100 relative overflow-hidden">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-200/50 rounded-full blur-3xl"></div>
             
             {prediction ? (
               <div className="relative z-10 space-y-6 h-full flex flex-col justify-center animate-in fade-in">
                 <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-pink-100 shadow-sm">
                    <p className="text-sm font-black uppercase tracking-widest text-pink-600 mb-1">{t('Next Period Expected')}</p>
                    <p className="text-3xl font-black text-neutral-900">{prediction.next.toLocaleDateString()}</p>
                 </div>
                 <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-sm">
                    <p className="text-sm font-black uppercase tracking-widest text-purple-600 mb-1">{t('Estimated Ovulation')}</p>
                    <p className="text-2xl font-black text-neutral-900">{prediction.ovulation.toLocaleDateString()}</p>
                    <p className="text-xs font-semibold text-neutral-500 mt-2 flex items-center gap-1">
                      <Activity size={14} className="text-purple-500" /> {t('High fertility window starts ~3 days prior')}
                    </p>
                 </div>
               </div>
             ) : (
               <div className="relative z-10 h-full flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-pink-300">
                   <Info size={32} />
                 </div>
                 <p className="text-neutral-500 font-medium max-w-[200px]">{t('Log your cycle details to generate personalized health predictions.')}</p>
               </div>
             )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-200 flex items-start gap-4">
           <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
             <CheckCircle2 size={18} />
           </div>
           <div>
             <h3 className="font-bold text-neutral-900 mb-1">{t('Private & Secure')}</h3>
             <p className="text-sm text-neutral-500 leading-relaxed">
                {t('Your reproductive health data is encrypted and stored locally. It is never shared with third parties or used for advertising purposes.')}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
