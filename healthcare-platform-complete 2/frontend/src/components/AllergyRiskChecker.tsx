import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2, Plus, X, Search, Activity, Pill, Utensils, Zap } from 'lucide-react';
import { useAllergyRisk, AllergyRiskInput } from '@/hooks/useAllergyRisk';
import AllergyRiskResult from './AllergyRiskResult';

const ALLERGY_OPTIONS = ['peanuts', 'penicillin', 'dust', 'pollen', 'shellfish', 'latex', 'dairy', 'gluten', 'eggs', 'soy'];
const MEDICINE_OPTIONS = ['Amoxicillin', 'Augmentin', 'Benadryl', 'Advil', 'Tylenol', 'Aspirin', 'Claritin'];
const FOOD_OPTIONS = ['bread', 'milk', 'peanut butter', 'shrimp', 'pasta', 'eggs', 'tofu', 'salad', 'pizza', 'cookies'];

const AllergyRiskChecker: React.FC = () => {
  const { checkRisk, saveToHistory, isLoading, result, setResult } = useAllergyRisk();
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<AllergyRiskInput>({
    known_allergies: [],
    prescribed_medicines: [],
    food_intake: [],
    age: 30,
    season: 'spring',
    existing_conditions: ['none']
  });

  const toggleItem = (list: keyof AllergyRiskInput, item: string) => {
    setInputs(prev => {
      const current = prev[list] as string[];
      if (current.includes(item)) {
        return { ...prev, [list]: current.filter(i => i !== item) };
      }
      return { ...prev, [list]: [...current, item] };
    });
  };

  const handlePredict = async () => {
    const res = await checkRisk(inputs);
    if (res) setStep(4);
  };

  const reset = () => {
    setStep(1);
    setResult(null);
  };

  const StepIndicator = () => (
    <div className="flex justify-between mb-8 px-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step === i ? 'bg-primary text-white scale-110 shadow-lg' : step > i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {step > i ? '✓' : i}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${step === i ? 'text-primary' : 'text-slate-400'}`}>
            {i === 1 ? 'Allergies' : i === 2 ? 'Meds' : 'Intake'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Allergy Reaction Risk</h2>
            <p className="text-slate-400 text-xs">AI-Powered Safety Assessment</p>
          </div>
        </div>
        {step < 4 && <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded">Step {step}/3</span>}
      </div>

      <div className="p-8">
        {step < 4 && <StepIndicator />}

        <div className="min-h-[300px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500" /> Known Allergies
              </h3>
              <p className="text-slate-500 text-sm mb-6">Select any substances you are known to be allergic to.</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleItem('known_allergies', opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${inputs.known_allergies.includes(opt) ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'}`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
                <button className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-dashed border-slate-200 text-slate-400 flex items-center gap-1 hover:border-primary hover:text-primary transition-all">
                  <Plus className="w-4 h-4" /> Add Custom
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" /> Prescribed Medicines
              </h3>
              <p className="text-slate-500 text-sm mb-6">What medicines have you taken recently or been prescribed?</p>
              <div className="space-y-3">
                {MEDICINE_OPTIONS.map(opt => (
                  <div 
                    key={opt}
                    onClick={() => toggleItem('prescribed_medicines', opt)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${inputs.prescribed_medicines.includes(opt) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-slate-50 border-transparent grayscale'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <Pill className={`w-5 h-5 ${inputs.prescribed_medicines.includes(opt) ? 'text-primary' : 'text-slate-300'}`} />
                      </div>
                      <span className="font-bold">{opt}</span>
                    </div>
                    {inputs.prescribed_medicines.includes(opt) && <ShieldCheck className="w-5 h-5 text-primary" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-500" /> Food & Intake
              </h3>
              <p className="text-slate-500 text-sm mb-6">Select food items or groups you've consumed in the last 24 hours.</p>
              <div className="grid grid-cols-2 gap-3">
                {FOOD_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleItem('food_intake', opt)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${inputs.food_intake.includes(opt) ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-slate-50 border-transparent grayscale'}`}
                  >
                    <span className="font-bold block mb-1">{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                    <span className="text-[10px] text-slate-400">Tap to select</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && result && (
            <div className="animate-in zoom-in-95 duration-500">
              <AllergyRiskResult 
                result={result} 
                onSave={() => saveToHistory(inputs, result)}
                onEmergency={() => alert("Emergency alert sent to contacts!")}
              />
              <button 
                onClick={reset}
                className="w-full mt-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all text-sm"
              >
                Perform New Check
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 4 && (
          <div className="flex gap-4 mt-8 pt-8 border-t border-slate-100">
            {step > 1 && (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
            )}
            <button
              onClick={step === 3 ? handlePredict : () => setStep(prev => prev + 1)}
              disabled={isLoading}
              className={`flex-[2] py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transition-all shadow-lg hover:shadow-primary/30 ${isLoading ? 'bg-slate-200 text-slate-400' : 'bg-primary text-white hover:bg-primary-dark'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Conflicts...
                </>
              ) : step === 3 ? (
                <>
                  <Zap className="w-5 h-5 fill-current" /> Get AI Risk Analysis
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllergyRiskChecker;
