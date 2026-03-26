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
  meal_plan?: {
    breakfast: Meal;
    mid_morning: Meal;
    lunch: Meal;
    evening_snack: Meal;
    dinner: Meal;
  };
  weekly_plan?: Array<{
    day: number;
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
  }>;
  total_nutrition?: {
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
  const [history, setHistory] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [activeDay, setActiveDay] = useState(1);
  const [preferences, setPreferences] = useState({
    goals: 'Weight Loss',
    diet_type: 'Vegetarian',
    cuisine_preference: 'North Indian',
    cultural_context: '',
    is_weekly: false
  });

  const fetchPlan = async (isWeekly: boolean = false) => {
    try {
      setIsLoading(true);
      setPlan(null); // Clear plan to show loading clearly
      const res = await apiClient.post('/nutrition/plan', { ...preferences, is_weekly: isWeekly });
      setPlan(res.data);
      if (isWeekly) setActiveDay(1);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = plan?.weekly_plan ? plan.weekly_plan.find(p => p.day === activeDay) : plan;
  const [discoveredDishes, setDiscoveredDishes] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    category: 'Lunch',
    region: 'North',
    diet: 'Vegetarian'
  });

  const fetchDishes = async () => {
     try {
       setIsSearching(true);
       const res = await apiClient.get('/nutrition/dishes', { params: searchFilters });
       setDiscoveredDishes(res.data);
     } catch (error) {
       console.error('Error fetching dishes:', error);
     } finally {
       setIsSearching(false);
     }
  };

  useEffect(() => {
     fetchDishes();
  }, [searchFilters]);

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
        
        {/* Header (Centered) */}
        <div className="flex flex-col items-center text-center gap-4 border-b border-slate-200 pb-12">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">AI Nutrition Coach</h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl">Your personalized nutritional strategy, optimized by clinical AI.</p>
          </div>
        </div>

        {!plan && !isLoading ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 space-y-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-[100px] -z-0 opacity-50"></div>
                
                <div className="relative z-10 space-y-3 text-center">
                   <h2 className="text-3xl font-black text-slate-900">Customize your plan</h2>
                   <p className="text-slate-600 font-medium">Tell us your preferences for a perfectly balanced day.</p>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">I want to achieve</label>
                      <select 
                        value={preferences.goals}
                        onChange={(e) => setPreferences({...preferences, goals: e.target.value})}
                        className="w-full h-14 bg-slate-50 border-transparent rounded-2xl px-6 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-primary-700 transition-all appearance-none cursor-pointer"
                      >
                         <option>Weight Loss</option>
                         <option>Muscle Gain</option>
                         <option>General Fitness</option>
                         <option>Diabetes Management</option>
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">My Diet style</label>
                      <select 
                         value={preferences.diet_type}
                         onChange={(e) => setPreferences({...preferences, diet_type: e.target.value})}
                         className="w-full h-14 bg-slate-50 border-transparent rounded-2xl px-6 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-primary-700 transition-all appearance-none cursor-pointer"
                      >
                         <option>Vegetarian</option>
                         <option>Non-Vegetarian</option>
                         <option>Vegan</option>
                         <option>Eggetarian</option>
                      </select>
                   </div>
                </div>

                <div className="relative z-10 space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Preferred Regional Cuisine</label>
                   <div className="flex flex-wrap gap-2">
                      {['North', 'South', 'East', 'West', 'Central', 'North East', 'Kashmiri', 'Rajasthani', 'Hyderabadi', 'Kerala', 'Konkani'].map(c => (
                        <button
                          key={c}
                          onClick={() => setPreferences({...preferences, cuisine_preference: c})}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            preferences.cuisine_preference === c ? 'bg-primary-700 border-primary-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-primary-700 hover:bg-slate-50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="relative z-10 space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Specific Cultural Background (Optional)</label>
                   <input 
                     type="text"
                     placeholder="e.g. Chettinad, Udupi, Marwari, Parsi, Jain (No onion/garlic)"
                     value={preferences.cultural_context}
                     onChange={(e) => setPreferences({...preferences, cultural_context: e.target.value})}
                     className="w-full h-14 bg-slate-50 border-transparent rounded-2xl px-6 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-primary-700 transition-all outline-none"
                   />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-4 pt-4">
                   <button 
                     onClick={() => fetchPlan(false)}
                     disabled={isLoading}
                     className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-5 rounded-[24px] font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                   >
                     1-Day Plan <Zap size={22} fill="currentColor" className="text-primary-700" />
                   </button>
                   <button 
                     onClick={() => fetchPlan(true)}
                     disabled={isLoading}
                     className="flex-1 bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                   >
                     Weekly 7-Day Plan <ClipboardList size={22} className="text-primary-500" />
                   </button>
                </div>
              </div>
           </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
             <div className="w-20 h-20 border-8 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-xl font-bold text-slate-900 animate-pulse">Consulting AI Nutritionist...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-20">
             
             {plan?.weekly_plan && (
                <div className="flex flex-wrap justify-center gap-3 bg-white p-3 rounded-[32px] border border-slate-200 shadow-sm">
                   {plan.weekly_plan.map(p => (
                      <button 
                        key={p.day}
                        onClick={() => setActiveDay(p.day)}
                        className={`w-14 h-14 rounded-2xl font-black text-sm transition-all ${
                           activeDay === p.day ? 'bg-primary-700 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                         D{p.day}
                      </button>
                   ))}
                </div>
             )}

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Meal Plan */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                      <div className="flex justify-between items-center mb-8">
                         <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <Utensils className="text-primary-700" size={28} /> 
                            {plan?.weekly_plan ? `Day ${activeDay} Strategy` : "Today's Meal Strategy"}
                         </h2>
                         <button 
                            onClick={() => setPlan(null)}
                            className="text-xs font-black uppercase text-slate-400 hover:text-primary-700 tracking-widest"
                         >
                            ← Redesign plan
                         </button>
                      </div>

                      <div className="space-y-6">
                         {currentPlan?.meal_plan && Object.entries(currentPlan.meal_plan).map(([meal, data]: [string, any]) => (
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
                            <p className="text-2xl font-black">{currentPlan?.total_nutrition?.calories}</p>
                         </div>
                         <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Protein</p>
                            <p className="text-2xl font-black text-green-400">{currentPlan?.total_nutrition?.protein}g</p>
                         </div>
                         <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Carbs</p>
                            <p className="text-2xl font-black text-blue-400">{currentPlan?.total_nutrition?.carbs}g</p>
                         </div>
                         <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Fats</p>
                            <p className="text-2xl font-black text-orange-400">{currentPlan?.total_nutrition?.fats}g</p>
                         </div>
                      </div>
                   </div>

                   {/* AI Tips */}
                   <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                         <Info className="text-primary-700" size={20} /> AI Recommendations
                      </h3>
                      <div className="space-y-4">
                         {(plan?.tips || []).map((tip, i) => (
                           <div key={i} className="flex gap-4 group p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                              <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 flex flex-shrink-0 items-center justify-center text-xs font-black">
                                {i+1}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed font-medium">{tip}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Discovery Section (Always visible at bottom) */}
        <div className="pt-10 border-t border-slate-200">
           <div className="bg-white rounded-[40px] border border-slate-200 p-8 md:p-12 space-y-10 shadow-sm">
              <div className="text-center space-y-3">
                 <h2 className="text-4xl font-black text-slate-900">Food Discovery Library</h2>
                 <p className="text-slate-500 font-medium tracking-tight">Browse over 700+ curated dishes across all Indian regions.</p>
              </div>

              {/* Discovery Filters */}
              <div className="flex flex-col md:flex-row gap-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Category</label>
                    <select 
                      value={searchFilters.category}
                      onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
                      className="w-full h-12 bg-white rounded-xl border-transparent font-bold text-slate-700 px-4 focus:ring-2 focus:ring-primary-700 transition-all cursor-pointer shadow-sm"
                    >
                       {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage'].map(c => <option key={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Region</label>
                    <select 
                      value={searchFilters.region}
                      onChange={(e) => setSearchFilters({...searchFilters, region: e.target.value})}
                      className="w-full h-12 bg-white rounded-xl border-transparent font-bold text-slate-700 px-4 focus:ring-2 focus:ring-primary-700 transition-all cursor-pointer shadow-sm"
                    >
                       {['North', 'South', 'East', 'West', 'Central', 'North East', 'Kashmiri', 'Rajasthani', 'Kerala', 'Hyderabadi', 'Konkani', 'Punjabi', 'Bengali', 'Gujarati', 'Tamilian'].map(r => <option key={r}>{r}</option>)}
                    </select>
                 </div>
                 <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Diet</label>
                    <select 
                      value={searchFilters.diet}
                      onChange={(e) => setSearchFilters({...searchFilters, diet: e.target.value})}
                      className="w-full h-12 bg-white rounded-xl border-transparent font-bold text-slate-700 px-4 focus:ring-2 focus:ring-primary-700 transition-all cursor-pointer shadow-sm"
                    >
                       <option>Vegetarian</option>
                       <option>Non-Vegetarian</option>
                    </select>
                 </div>
              </div>

              {/* Discovery Results */}
              {isSearching ? (
                 <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {discoveredDishes.map(dish => (
                       <div key={dish.id} className="bg-white border border-slate-100 p-6 rounded-[32px] hover:border-primary-700 hover:shadow-xl transition-all group overflow-hidden relative">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-0 opacity-0 group-hover:opacity-100 transition-all"></div>
                          <div className="relative z-10 space-y-4">
                             <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${dish.diet === 'Vegetarian' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                   {dish.diet}
                                </span>
                                <span className="text-slate-300 text-[10px] font-bold">#{dish.id}</span>
                             </div>
                             <div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 group-hover:text-primary-700 transition-colors">{dish.name}</h3>
                                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{dish.description}</p>
                             </div>
                             <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-50">
                                <div className="text-center">
                                   <p className="text-[8px] uppercase font-black text-slate-400">Cal</p>
                                   <p className="text-xs font-bold text-slate-700">{dish.macros.calories}</p>
                                </div>
                                <div className="text-center border-l border-slate-50">
                                   <p className="text-[8px] uppercase font-black text-slate-400">P</p>
                                   <p className="text-xs font-bold text-green-600">{dish.macros.protein}g</p>
                                </div>
                                <div className="text-center border-l border-slate-50">
                                   <p className="text-[8px] uppercase font-black text-slate-400">C</p>
                                   <p className="text-xs font-bold text-blue-600">{dish.macros.carbs}g</p>
                                </div>
                                <div className="text-center border-l border-slate-50">
                                   <p className="text-[8px] uppercase font-black text-slate-400">F</p>
                                   <p className="text-xs font-bold text-orange-600">{dish.macros.fats}g</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                    {discoveredDishes.length === 0 && (
                       <div className="col-span-full py-20 text-center space-y-4">
                          <div className="text-5xl">🔭</div>
                          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching dishes found. Try relaxing the filters.</p>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
