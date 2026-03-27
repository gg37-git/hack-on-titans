import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, Info, Save, Phone, MapPin } from 'lucide-react';

interface AllergyRiskResultProps {
  result: {
    probability: number;
    risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
    triggered_by: string[];
    recommendation: string;
  };
  onSave?: () => void;
  onEmergency?: () => void;
}

const AllergyRiskResult: React.FC<AllergyRiskResultProps> = ({ result, onSave, onEmergency }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-200 shadow-[0_0_20px_rgba(225,29,72,0.2)]';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Low': return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
      case 'Moderate': return <Info className="w-8 h-8 text-amber-500" />;
      case 'High': return <AlertTriangle className="w-8 h-8 text-orange-500" />;
      case 'Critical': return <AlertOctagon className="w-8 h-8 text-rose-600 animate-pulse" />;
      default: return <Info className="w-8 h-8 text-slate-500" />;
    }
  };

  const progressColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-emerald-500';
      case 'Moderate': return 'bg-amber-500';
      case 'High': return 'bg-orange-500';
      case 'Critical': return 'bg-rose-600';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border-2 transition-all duration-500 ${getRiskColor(result.risk_level)}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/50 rounded-xl">
            {getRiskIcon(result.risk_level)}
          </div>
          <div>
            <h3 className="text-xl font-bold">Allergy Risk: {result.risk_level}</h3>
            <p className="opacity-80 text-sm">Based on {Math.round(result.probability * 100)}% predictive confidence</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black">{Math.round(result.probability * 100)}%</span>
        </div>
      </div>

      <div className="w-full bg-white/30 h-3 rounded-full overflow-hidden mb-6">
        <div 
          className={`h-full transition-all duration-1000 ${progressColor(result.risk_level)}`} 
          style={{ width: `${Math.max(5, result.probability * 100)}%` }}
        />
      </div>

      {result.triggered_by.length > 0 && (
        <div className="mb-6 bg-white/40 p-4 rounded-xl border border-white/20">
          <h4 className="font-bold flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" /> Conflict Conflicts Detected:
          </h4>
          <ul className="space-y-1 text-sm list-disc list-inside">
            {result.triggered_by.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-4 bg-white/60 rounded-xl border border-white/30 backdrop-blur-sm mb-6">
        <p className="font-medium leading-relaxed italic text-sm">"{result.recommendation}"</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {onSave && (
          <button 
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white rounded-lg font-semibold text-sm transition-colors border border-black/5"
          >
            <Save className="w-4 h-4" /> Save to History
          </button>
        )}
        
        {result.risk_level === 'Critical' && (
          <>
            <button 
              onClick={onEmergency}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-bold text-sm transition-all animate-bounce"
            >
              <Phone className="w-4 h-4" /> Call Emergency
            </button>
            <button 
              onClick={() => window.location.href='/doctors'}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-black rounded-lg font-bold text-sm transition-all"
            >
              <MapPin className="w-4 h-4" /> Nearby Hospitals
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-[10px] opacity-60 leading-tight">
        DISCLAIMER: This is an AI prediction tool. Always consult your doctor or visit emergency services if you experience allergic symptoms.
      </p>
    </div>
  );
};

export default AllergyRiskResult;
