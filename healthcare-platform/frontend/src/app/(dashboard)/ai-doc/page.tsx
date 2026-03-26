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
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 p-4 shrink-0 shadow-sm z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl">
            🤖
          </div>
          <div>
            <h1 className="font-bold text-neutral-900 leading-tight">AI Doctor Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Online • Powered by AI</span>
            </div>
          </div>
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
              <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                m.role === 'user' 
                  ? 'bg-primary-700 text-white rounded-tr-none' 
                  : 'bg-white border border-neutral-200 text-neutral-700 rounded-tl-none'
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

      {/* Input Area */}
      <footer className="bg-white border-t border-neutral-200 p-4 shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak your health question here..."
              className="w-full bg-neutral-100 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 transition-all border border-transparent"
            />
            <button
              type="button"
              onClick={handleToggleListening}
              className={`absolute right-2 top-1.5 p-2 rounded-lg transition-colors ${
                listening ? 'bg-red-500 text-white animate-pulse' : 'text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600'
              }`}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary-700 text-white p-3 rounded-xl hover:bg-primary-800 disabled:opacity-50 transition-colors shadow-md"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] text-center text-neutral-400 mt-2 font-medium tracking-tight">
          AI-generated responses. Not a substitute for professional medical advice.
        </p>
      </footer>
    </div>
  );
}
