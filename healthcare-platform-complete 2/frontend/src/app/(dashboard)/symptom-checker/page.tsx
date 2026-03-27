'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Send, History, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface AnalysisResult {
  possible_conditions: string[];
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
  warning_signs: string[];
}

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [showHistory, setShowHistory] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setSymptoms(transcript);
    }
  }, [transcript]);

  const handleToggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    try {
      setIsLoading(true);
      const res = await apiClient.post('/symptoms', {
        symptoms_text: symptoms,
        duration,
        intensity
      });
      setResult(res.data.analysis);
      fetchHistory();
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/symptoms/history');
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return <div className="p-8 text-center">Browser doesn&apos;t support speech recognition.</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header (Centered) */}
        <div className="flex flex-col items-center text-center gap-6 border-b border-neutral-200 pb-10">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">Symptom Checker</h1>
            <p className="text-neutral-500 text-lg font-medium max-w-2xl">Describe your symptoms for an AI-powered clinical health analysis and guidance.</p>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 bg-white border border-neutral-200 px-6 py-3 rounded-full text-primary-700 hover:bg-primary-50 hover:border-primary-200 transition-all font-bold shadow-sm"
          >
            <History size={18} />
            {showHistory ? 'Hide Session History' : 'View Past Analyses'}
          </button>
        </div>

        {showHistory && (
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold mb-4">Past Analysis</h2>
            {history.length === 0 ? (
              <p className="text-neutral-500 italic">No history found.</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="p-4 border border-neutral-200 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-neutral-900 truncate max-w-md">{h.symptoms_text}</p>
                      <p className="text-xs text-neutral-500">{new Date(h.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      h.analysis_result?.urgency === 'high' ? 'bg-red-100 text-red-700' : 
                      h.analysis_result?.urgency === 'medium' ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {h.analysis_result?.urgency}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[32px] p-8 space-y-8 shadow-sm">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">What symptoms are you feeling?</label>
                <div className="relative">
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="E.g. I have a sharp pain in my chest that started this morning..."
                    className="w-full bg-slate-50 border-transparent rounded-2xl p-6 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-700 transition-all min-h-[160px] pr-14 text-lg"
                  />
                  <button
                    type="button"
                    onClick={handleToggleListening}
                    className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all ${
                      listening ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse' : 'bg-white text-slate-400 hover:text-primary-700 border border-slate-100 shadow-sm'
                    }`}
                  >
                    {listening ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="E.g. 2 days"
                    className="w-full h-14 bg-slate-50 border-transparent rounded-2xl px-6 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-700 transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Intensity (1-10)</label>
                  <div className="pt-4 px-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-700 transition-all"
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                      <span>Mild</span>
                      <span className="text-primary-700">{intensity} / 10</span>
                      <span>Severe</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !symptoms.trim()}
                className="bg-primary-700 text-white w-full py-5 rounded-[24px] font-black text-lg hover:bg-primary-800 disabled:opacity-50 transition-all shadow-xl shadow-primary-700/20 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Check Symptoms Now
                  </>
                )}
              </button>
            </form>

            {/* Results Section */}
            {result && (
              <div className="card space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <h2 className="text-xl font-bold text-neutral-900">Analysis Result</h2>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold uppercase ${
                    result.urgency === 'high' ? 'bg-red-100 text-red-700' : 
                    result.urgency === 'medium' ? 'bg-orange-100 text-orange-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {result.urgency === 'high' && <AlertCircle size={16} />}
                    {result.urgency === 'low' && <CheckCircle2 size={16} />}
                    Urgency: {result.urgency}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Possible Conditions:</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.possible_conditions.map((c, i) => (
                        <span key={i} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-md text-sm border border-primary-100">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">Recommendations:</h3>
                      <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                        {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Warning Signs:</h3>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {result.warning_signs.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    <strong>Disclaimer:</strong> This is an AI-powered analysis for informational purposes only. It is not a medical diagnosis. If you are experiencing an emergency, please call your local emergency services immediately.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Quick Tips */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <span>💡</span> Tips for Better Accuracy
              </h3>
              <ul className="text-sm text-neutral-600 space-y-3">
                <li className="flex gap-2">
                  <span className="text-primary-700 font-bold">•</span>
                  Identify exactly where the symptom is located.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary-700 font-bold">•</span>
                  Describe the sensation (sharp, dull, throbbing).
                </li>
                <li className="flex gap-2">
                  <span className="text-primary-700 font-bold">•</span>
                  Mention anything that makes it better or worse.
                </li>
              </ul>
            </div>

            <div className="bg-neutral-900 p-6 rounded-2xl text-white">
              <h3 className="font-semibold mb-2">Speak to a Doctor</h3>
              <p className="text-neutral-400 text-xs mb-4">Need professional advice? Book a consultation with a specialist now.</p>
              <button 
                onClick={() => window.location.href = '/doctors'}
                className="w-full bg-white text-neutral-900 text-sm font-bold py-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Find Doctors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
