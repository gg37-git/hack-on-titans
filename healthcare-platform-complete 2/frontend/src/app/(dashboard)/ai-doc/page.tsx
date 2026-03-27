'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Info, RefreshCw, Mic, MicOff, Activity, ShieldAlert, FileText, Download, Mail, ChevronRight, Stethoscope } from 'lucide-react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import apiClient from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  message: string;
  timestamp?: string;
}

export default function AIDocPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [context, setContext] = useState<any>({ vitals: [], allergies: [] });
  const [report, setReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isEmailingReport, setIsEmailingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleToggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContext = async () => {
    try {
      const [vitalsRes, allergyRes] = await Promise.all([
        apiClient.get('/health-score/history'),
        apiClient.get('/allergy-risk/history')
      ]);
      setContext({
        vitals: vitalsRes.data.slice(0, 3) || [],
        allergies: allergyRes.data.slice(0, 3) || []
      });
    } catch (e) {
      console.error('Context fetch error:', e);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsFetchingHistory(true);
      const res = await apiClient.get('/ai-doc/history');
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchContext();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    if (listening) resetTranscript();
    setMessages(prev => [...prev, { role: 'user', message: userMessage }]);
    
    try {
      setIsLoading(true);
      const res = await apiClient.post('/ai-doc', {
        message: userMessage,
        conversation_history: messages.map(m => ({ role: m.role, content: m.message }))
      });
      setMessages(prev => [...prev, { role: 'assistant', message: res.data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', message: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const res = await apiClient.post('/ai-doc/generate-report');
      setReport(res.data.summary);
    } catch (e) {
      console.error('Report error:', e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleEmailReport = async () => {
    if (!report) return;
    try {
      setIsEmailingReport(true);
      await apiClient.post('/ai-doc/email-report', { summary: report });
      alert('Clinical report has been sent to your Gmail.');
    } catch (e) {
      console.error('Email error:', e);
    } finally {
      setIsEmailingReport(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="p-8 text-center text-slate-500">Browser doesn&apos;t support speech recognition.</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Left Sidebar: Clinical Context */}
      <aside className="w-80 bg-white border-r border-slate-200 hidden xl:flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-100">
           <div className="flex items-center gap-3 text-primary-700 font-black tracking-tight text-lg italic uppercase">
              <Stethoscope size={24} /> CLINICAL CONTEXT
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           
           {/* Patient Vitals Summary */}
           <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={14} className="text-primary-500" /> Recent Vitals
              </h3>
              {context.vitals && context.vitals.length > 0 ? (
                <div className="space-y-3">
                   {context.vitals.map((v: any, i: number) => (
                     <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-primary-200 transition-all">
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(v.created_at).toLocaleDateString()}</p>
                           <p className="text-sm font-black text-slate-900 group-hover:text-primary-700">{v.score}% <span className="text-xs font-medium text-slate-500">Stability</span></p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-primary-600 font-bold text-xs">
                           {v.score > 70 ? 'A+' : 'B'}
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No vitals on record.</p>
              )}
           </section>

           {/* Health Risk Alerts */}
           <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <ShieldAlert size={14} className="text-red-500" /> Critical Risks
              </h3>
              {context.allergies && context.allergies.length > 0 ? (
                <div className="space-y-3">
                   {context.allergies.map((a: any, i: number) => (
                     <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all ${
                       a.risk_level === 'Critical' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
                     }`}>
                        <div className="flex justify-between items-center">
                           <span className={`text-[10px] font-black uppercase ${a.risk_level === 'Critical' ? 'text-red-600' : 'text-slate-500'}`}>
                              {a.risk_level} Risk
                           </span>
                           <span className="text-[10px] text-slate-400 font-medium">{new Date(a.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 line-clamp-2">{a.triggered_by.join(', ')}</p>
                     </div>
                   ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Patient is allergy-stable.</p>
              )}
           </section>
        </div>
        <div className="p-8 bg-slate-50 border-t border-slate-200">
           <button className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              <FileText size={14} /> Full EHR Access
           </button>
        </div>
      </aside>

      {/* Main Column: Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-2xl z-10 relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 z-20">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                 <Bot size={20} />
              </div>
              <div>
                 <h1 className="text-lg font-black text-slate-900 tracking-tight">AI Clinical Assistant</h1>
                 <p className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online for Consult
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport || messages.length < 2}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
              >
                 {isGeneratingReport ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} 
                 {isGeneratingReport ? 'Analyzing...' : 'Generate Report'}
              </button>
              <button onClick={fetchHistory} className="p-2.5 text-slate-400 hover:text-primary-700 transition-colors bg-slate-50 rounded-xl border border-slate-100">
                 <RefreshCw size={18} />
              </button>
           </div>
        </header>

        {/* Messaging Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth custom-scrollbar bg-white">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Welcome Logic */}
            <div className="flex gap-4 group">
               <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 transition-all group-hover:bg-primary-50">
                  <Bot size={20} />
               </div>
               <div className="space-y-4">
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl rounded-tl-none shadow-sm shadow-slate-100/50">
                     <p className="text-sm text-slate-700 leading-relaxed mb-4">Hello. I am the CuraLink Clinical Assistant. I've initialized with your recent health context. How can I assist with your diagnostic analysis today?</p>
                     <div className="flex gap-2 flex-wrap">
                        {['Explain my allergy risk', 'Analyze recent fatigue', 'Chest pain check'].map(tag => (
                          <button key={tag} onClick={() => setInput(tag)} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:border-primary-200 hover:text-primary-700 transition-all">{tag}</button>
                        ))}
                     </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-800">
                     <Info size={16} className="shrink-0 mt-0.5" />
                     <p className="text-[11px] font-medium leading-tight">Emergency protocol active. If you feel immediate danger, bypass AI and call emergency services.</p>
                  </div>
               </div>
            </div>

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  m.role === 'user' ? 'bg-primary-50 text-primary-700' : 'bg-slate-50 text-slate-700'
                } border border-slate-100 shadow-sm shrink-0`}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[80%] p-6 rounded-3xl shadow-sm leading-relaxed text-sm whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-primary-700 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-slate-100/50 font-medium'
                }`}>
                  {m.message}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                  <Bot size={20} />
                </div>
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl rounded-tl-none">
                  <Loader2 className="animate-spin text-slate-300" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-8" />
          </div>
        </main>

        {/* Input Bar */}
        <footer className="p-8 bg-white border-t border-slate-100">
           <div className="max-w-3xl mx-auto">
             <form onSubmit={handleSend} className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your symptoms for clinical analysis..."
                  className="w-full bg-slate-50 border-slate-200 border rounded-[32px] pl-8 pr-32 py-5 text-base focus:bg-white focus:ring-4 focus:ring-primary-700/5 focus:border-primary-700 outline-none transition-all shadow-inner placeholder:text-slate-400 text-slate-900"
                />
                <div className="absolute right-3 top-3 flex gap-2">
                   <button
                     type="button"
                     onClick={handleToggleListening}
                     className={`p-3 rounded-full transition-all ${
                       listening ? 'bg-red-500 text-white scale-110 shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:text-primary-700'
                     }`}
                   >
                     {listening ? <MicOff size={20} /> : <Mic size={20} />}
                   </button>
                   <button
                     type="submit"
                     disabled={isLoading || !input.trim()}
                     className="bg-primary-700 text-white p-3 rounded-full hover:bg-primary-800 disabled:opacity-20 transition-all flex items-center justify-center"
                   >
                     <Send size={20} />
                   </button>
                </div>
             </form>
           </div>
        </footer>
      </div>

      {/* Right Sidebar: Generated Report & Insights */}
      <aside className="w-96 bg-[#fcfdfe] border-l border-slate-200 hidden 2xl:flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-100 bg-white">
           <div className="flex items-center gap-3 text-slate-900 font-black tracking-tight text-lg uppercase italic">
              <FileText size={24} className="text-slate-400" /> Clinical Report
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
           {report ? (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis Complete</span>
                   <button 
                     onClick={handleEmailReport}
                     disabled={isEmailingReport}
                     className="text-primary-700 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                   >
                      {isEmailingReport ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />} Send to Gmail
                   </button>
                </div>
                <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-sm text-xs text-slate-700 leading-loose prose prose-slate">
                   <pre className="whitespace-pre-wrap font-sans">{report}</pre>
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">Report generated {new Date().toLocaleTimeString()}</p>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                   <FileText size={32} />
                </div>
                <div className="space-y-2">
                   <h4 className="font-black text-slate-900 uppercase tracking-tight">No Active Report</h4>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium">Click "Generate Report" above to synthesize your consultation into a structured clinical document.</p>
                </div>
             </div>
           )}

           <div className="pt-10 border-t border-slate-200/50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Live AI Insights</h3>
              <div className="space-y-4">
                 {[
                   { icon: <ShieldAlert size={14} />, text: "Contextual reasoning active", color: "text-blue-600 bg-blue-50" },
                   { icon: <ChevronRight size={14} />, text: "SOAP Protocol enabled", color: "text-green-600 bg-green-50" },
                   { icon: <Info size={14} />, text: "Gmail gateway ready", color: "text-purple-600 bg-purple-50" }
                 ].map((tip, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-105">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tip.color}`}>{tip.icon}</div>
                      <span className="text-[11px] font-bold text-slate-600">{tip.text}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </aside>

    </div>
  );
}
