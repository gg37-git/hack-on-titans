'use client';

import { useState, useEffect } from 'react';
import { Apple, Utensils, Zap, ClipboardList, Plus, History, ChevronRight, Info, CheckCircle2, Flame, Wheat, Droplets, Watch, Heart, Bell, Activity, Thermometer, ShieldAlert } from 'lucide-react';
import apiClient from '@/lib/api';

interface Meal {
  dish: string;
  ingredients: string;
  benefit: string;
}

interface NutritionPlan {
  meal_plan: {
    breakfast: Meal;
    mid_morning: Meal;
    lunch: Meal;
    evening_snack: Meal;
    dinner: Meal;
  };
  total_nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  tips: string[];
}

export default function NutritionPage() {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any // eslint-disable-line @typescript-eslint/no-explicit-any
  const [preferences, setPreferences] = useState({
    goals: 'Weight Loss',
    diet_type: 'Vegetarian',
    cuisine_preference: 'North Indian'
  });

  const fetchPlan = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.post('/nutrition/plan', preferences);
      setPlan(res.data);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/nutrition/history');
      setHistory(res.data);
    } catch (error) {
       console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Nutrition Coach</h1>
            <p className="text-slate-500 font-medium">Personalized Indian meal plans tailored to your health goals.</p>
          </div>
          <button 
            onClick={fetchPlan}
            disabled={isLoading}
            className="btn-primary px-8 py-4 rounded-3xl flex items-center gap-2 shadow-xl shadow-primary-700/20 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Today\'s Plan'} <Zap size={20} fill="currentColor" />
          </button>
        </div>

        {!plan && !isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-2 bg-white border border-slate-200 rounded-[40px] p-10 space-y-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">Customize your plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Your Goal</label>
                      <select 
                        value={preferences.goals}
                        onChange={(e) => setPreferences({...preferences, goals: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent focus:bg-white"
                      >
                         <option>Weight Loss</option>
                         <option>Muscle Gain</option>
                         <option>General Fitness</option>
                         <option>Diabetes Management</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Diet Type</label>
                      <select 
                         value={preferences.diet_type}
                         onChange={(e) => setPreferences({...preferences, diet_type: e.target.value})}
                         className="input-field h-14 bg-slate-50 border-transparent focus:bg-white"
                      >
                         <option>Vegetarian</option>
                         <option>Non-Vegetarian</option>
                         <option>Vegan</option>
                         <option>Eggetarian</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Indian Cuisine Preference</label>
                   <div className="flex flex-wrap gap-3">
                      {['North Indian', 'South Indian', 'Bengali', 'Maharashtrian', 'Gujarati'].map(c => (
                        <button
                          key={c}
                          onClick={() => setPreferences({...preferences, cuisine_preference: c})}
                          className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${
                            preferences.cuisine_preference === c ? 'bg-primary-700 border-primary-700 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-primary-700'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
             
             <div className="bg-primary-900 text-white rounded-[40px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">💡</div>
                  <h3 className="text-xl font-bold">Why Indian Specific?</h3>
                  <p className="text-primary-100 text-sm leading-relaxed">
                    Most global apps ignore the nutritional density of lentils, local spices like turmeric, and diverse regional grains like Ragi and Bajra. We tailor everything to your roots.
                  </p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-700 rounded-full blur-3xl opacity-50"></div>
             </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
             <div className="w-20 h-20 border-8 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-xl font-bold text-slate-900 animate-pulse">Consulting AI Nutritionist...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
             {/* Left Column: Meal Plan */}
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                   <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                      <Utensils className="text-primary-700" size={28} /> Today&apos;s Meal Strategy
                   </h2>
                   <div className="space-y-6">
                      {plan && Object.entries(plan.meal_plan).map(([meal, data]: [string, any]) => ( // eslint-disable-line @typescript-eslint/no-explicit-any // eslint-disable-line @typescript-eslint/no-explicit-any
                        <div key={meal} className="flex gap-6 group">
                           <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-700 group-hover:text-white transition-all text-xs font-black uppercase">
                                {meal[0]}
                              </div>
                              <div className="w-px flex-1 bg-slate-100 mt-2 mb-2"></div>
                           </div>
                           <div className="flex-1 pb-8">
                              <div className="flex justify-between items-start">
                                 <div>
                                   <h4 className="text-xs font-black uppercase text-primary-700 tracking-widest mb-1">{meal.replace('_', ' ')}</h4>
                                   <h3 className="text-xl font-bold text-slate-900">{data.dish}</h3>
                                   <p className="text-slate-500 text-sm mt-1">{data.ingredients}</p>
                                 </div>
                                 <div className="bg-green-50 text-green-700 text-[10px] font-black px-3 py-1 rounded-full border border-green-100 uppercase translate-y-2">
                                    {data.benefit}
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Right Column: Macros & Tips */}
             <div className="space-y-8">
                {/* Macro Summary */}
                <div className="bg-slate-900 text-white rounded-[40px] p-8 shadow-xl">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Zap className="text-primary-500" size={20} fill="currentColor" /> Daily Target
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Calories</p>
                         <p className="text-2xl font-black">{plan?.total_nutrition?.calories}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Protein</p>
                         <p className="text-2xl font-black text-green-400">{plan?.total_nutrition?.protein}g</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Carbs</p>
                         <p className="text-2xl font-black text-blue-400">{plan?.total_nutrition?.carbs}g</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                         <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Fats</p>
                         <p className="text-2xl font-black text-orange-400">{plan?.total_nutrition?.fats}g</p>
                      </div>
                   </div>
                   <div className="mt-6 flex items-center justify-between gap-4">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-[70%]" />
                      </div>
                      <span className="text-[10px] font-bold">70% Target</span>
                   </div>
                </div>

                {/* AI Tips */}
                <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                   <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Info className="text-primary-700" size={20} /> Pro Tips for Indians
                   </h3>
                   <div className="space-y-4">
                      {plan?.tips?.map((tip, i) => (
                        <div key={i} className="flex gap-4 group p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                           <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex flex-shrink-0 items-center justify-center text-xs font-black">
                             {i+1}
                           </div>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium">{tip}</p>
                        </div>
                      ))}
                   </div>
                </div>
                
                <button onClick={() => setPlan(null)} className="w-full py-4 text-slate-400 font-bold text-sm hover:text-primary-700 flex items-center justify-center gap-2 transition-all">
                  ← Redesign my plan
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
