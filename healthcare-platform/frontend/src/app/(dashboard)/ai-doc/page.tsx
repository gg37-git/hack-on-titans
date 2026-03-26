'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Info, RefreshCw, Mic, MicOff } from 'lucide-react';
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
      console.error('Error senting message:', error);
      setMessages(prev => [...prev, { role: 'assistant', message: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="p-8 text-center text-slate-500">Browser doesn&apos;t support speech recognition.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-neutral-50 overflow-hidden">
      <header className="bg-white border-b border-neutral-200 p-8 shrink-0 shadow-sm z-10 flex flex-col items-center text-center gap-4 relative">
        <div className="w-16 h-16 rounded-2xl bg-primary-700 flex items-center justify-center text-white text-3xl shadow-lg shadow-primary-100">
           🤖
        </div>
        <div>
           <h1 className="text-2xl font-black text-neutral-900 tracking-tight leading-tight">AI Clinical Assistant</h1>
           <p className="text-xs text-green-600 font-bold flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
              <span className="uppercase tracking-widest">Available for Expert Analysis</span>
           </p>
        </div>
        <button 
          onClick={fetchHistory}
          className="p-2 text-neutral-500 hover:text-primary-700 transition-colors"
          title="Refresh History"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Chat Area (Aerated) */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Message */}
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center text-purple-600 border border-purple-200">
              <Bot size={18} />
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-none p-4 shadow-sm text-sm text-neutral-700">
              <p className="mb-2">Hello! I'm your AI health assistant. I can help you understand symptoms, provide general medical information, and give wellness guidance.</p>
              <p className="font-medium flex items-center gap-1.5 text-xs text-neutral-500">
                <Info size={14} /> Please note: I am an AI, not a doctor. In case of an emergency, contact medical services immediately.
              </p>
            </div>
          </div>

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse ml-auto' : ''} max-w-[85%]`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                m.role === 'user' ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`p-5 rounded-3xl shadow-sm text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-primary-700 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-slate-200/50'
              }`}>
                {m.message}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%] animate-pulse">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center text-purple-600 border border-purple-200">
                <Bot size={22} />
              </div>
              <div className="bg-white border border-neutral-100 rounded-2xl rounded-tl-none p-5 shadow-sm">
                <Loader2 className="animate-spin text-purple-500" size={20} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-12" />
        </div>
      </main>

      {/* Input Area (Centered & Premium) */}
      <footer className="bg-white border-t border-slate-200 p-6 md:p-8 shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your health..."
              className="w-full bg-slate-50 border-slate-100 rounded-2xl pl-6 pr-14 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary-700 transition-all text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleToggleListening}
              className={`absolute right-2 top-2 p-3 rounded-xl transition-all ${
                listening ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse' : 'text-slate-300 hover:text-primary-700 hover:bg-slate-100'
              }`}
            >
              {listening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary-700 text-white p-4 rounded-2xl hover:bg-primary-800 disabled:opacity-50 transition-all shadow-xl shadow-primary-700/20 flex items-center justify-center shrink-0"
          >
            <Send size={24} />
          </button>
        </form>
        <div className="max-w-3xl mx-auto mt-4 flex items-center justify-center gap-2">
           <Info size={12} className="text-slate-400" />
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
             AI-generated content. Consult a real doctor for medical decisions.
           </p>
        </div>
      </footer>
    </div>
  );
}
