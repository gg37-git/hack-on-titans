'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Heart, MessageCircle, Send, Plus, History, Sparkles, Smile, MessageSquare, Meh, Frown, AlertCircle, Quote, Mic, MicOff } from 'lucide-react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import apiClient from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const moods = [
  { label: 'Happy', icon: <Smile className="text-green-500" size={32} />, value: 'happy', color: 'bg-green-50' },
  { label: 'Okay', icon: <Meh className="text-blue-500" size={32} />, value: 'okay', color: 'bg-blue-50' },
  { label: 'Sad', icon: <Frown className="text-orange-500" size={32} />, value: 'sad', color: 'bg-orange-50' },
  { label: 'Anxious', icon: <AlertCircle className="text-red-500" size={32} />, value: 'anxious', color: 'bg-red-50' },
];

export default function MentalHealthPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState('');
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMoodHistory = async () => {
    try {
      const res = await apiClient.get('/mental-health/mood-history');
      setMoodHistory(res.data);
    } catch (error) {
       console.error('Error fetching mood history:', error);
    }
  };

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const handleMoodSelect = async (mood: string) => {
    setCurrentMood(mood);
    try {
      await apiClient.post('/mental-health/mood', { mood, energy_level: 5 });
      fetchMoodHistory();
    } catch (error) {
      console.error('Error logging mood:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (listening) resetTranscript();
    setIsLoading(true);

    try {
      const res = await apiClient.post('/mental-health/chat', {
        message: input,
        conversation_history: messages,
        current_mood: currentMood
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="p-8 text-center text-slate-500">Browser doesn&apos;t support speech recognition.</div>;
  }

  return (
    <div className="h-full bg-[#f8fafc] p-4 md:p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto w-full space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
           <Brain className="text-primary-700" size={36} /> Mental Health Hub
        </h1>
        <p className="text-slate-500 font-medium">An empathetic space for you to share, track, and breathe.</p>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left: Mood Tracking */}
        <div className="lg:col-span-4 space-y-8 h-fit">
           <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <Heart className="text-red-500" size={20} fill="currentColor" /> How are you feeling?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                 {moods.map(m => (
                   <button
                     key={m.label}
                     onClick={() => handleMoodSelect(m.value)}
                     className={`p-6 rounded-[32px] border transition-all flex flex-col items-center gap-3 ${
                       currentMood === m.value ? `${m.color} border-primary-700 shadow-lg scale-105` : 'bg-white border-slate-100 hover:border-primary-700'
                     }`}
                   >
                      {m.icon}
                      <span className="text-xs font-black uppercase text-slate-500 tracking-widest">{m.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 text-white rounded-[40px] p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                   <Quote className="text-primary-500 rotate-180" size={20} fill="currentColor" /> Daily Quote
                 </h3>
                 <p className="text-primary-100 italic leading-relaxed">
                   "Your mental health is a priority. Your happiness is an essential. Your self-care is a necessity."
                 </p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-700 rounded-full blur-3xl opacity-50"></div>
           </div>

           {moodHistory.length > 0 && (
             <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">Recent History</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                   {moodHistory.slice(0, 7).map((h, i) => (
                     <div key={i} className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl grayscale hover:grayscale-0 transition-all border border-slate-100" title={new Date(h.created_at).toLocaleDateString()}>
                       {moods.find(m => m.value === h.mood)?.icon || '❔'}
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        {/* Right: AI Chat */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[40px] shadow-sm flex flex-col h-[600px] lg:h-auto overflow-hidden">
           {/* Chat Header */}
           <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary-50 text-primary-700 rounded-2xl flex items-center justify-center">
                    <Sparkles size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900">EmpathyBot</h3>
                    <p className="text-[10px] font-black uppercase text-green-500 tracking-widest">Active & Listening</p>
                 </div>
              </div>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-8 opacity-60">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <MessageSquare className="text-primary-700" size={32} />
                   </div>
                   <div className="space-y-2">
                     <p className="text-xl font-bold text-slate-900">I'm here for you.</p>
                     <p className="text-sm text-slate-500 max-w-xs">Whether you want to vent, find a mindfulness exercise, or just chat, I'm all ears.</p>
                   </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] p-5 rounded-[32px] text-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-primary-700 text-white rounded-br-none shadow-lg' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm font-medium'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-5 rounded-[32px] rounded-bl-none shadow-sm flex gap-2">
                     <div className="w-2 h-2 bg-primary-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <div className="w-2 h-2 bg-primary-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <div className="w-2 h-2 bg-primary-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
           </div>

           {/* Input Area */}
           <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-50 flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Share what's on your mind... (or click the mic to speak)"
                  className="w-full h-14 pl-6 pr-14 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-700 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={`absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    listening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                  }`}
                >
                  {listening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-700/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send size={24} />
              </button>
           </form>
        </div>

      </div>
    </div>
  );
}
