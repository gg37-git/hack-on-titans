'use client';

import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import FeatureCard from '@/components/common/FeatureCard';
import { 
  Stethoscope, 
  MessageSquare, 
  Activity, 
  Leaf, 
  Smile, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Search
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: "AI Symptom Checker",
      description: "Describe your symptoms in natural language and receive an instant preliminary analysis, urgency level, and possible conditions.",
      icon: <Stethoscope className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-50"
    },
    {
      title: "AI Doctor Assistant",
      description: "Chat with an empathetic AI assistant 24/7 for health guidance, advice, and detailed medical information.",
      icon: <MessageSquare className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-50"
    },
    {
      title: "Predictive Health Analytics",
      description: "Advanced algorithms analyze your profile to provide risk scores for Cardiovascular, Metabolic, and Respiratory health.",
      icon: <Activity className="w-8 h-8 text-emerald-600" />,
      color: "bg-emerald-50"
    },
    {
      title: "Indianized Nutrition Coach",
      description: "Receive personalized 1-day meal plans tailored specifically for Indian diets, including macros and seasonal produce tips.",
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      color: "bg-green-50"
    },
    {
      title: "Mental Health Support",
      description: "Contextual emotional support with mood tracking, psychological validations, and practical grounding techniques.",
      icon: <Smile className="w-8 h-8 text-amber-600" />,
      color: "bg-amber-50"
    },
    {
      title: "Preventive Ayurveda Remedies",
      description: "Access a curated database of natural Indian remedies like Haldi Doodh and Methi water for common ailments.",
      icon: <TrendingUp className="w-8 h-8 text-rose-600" />,
      color: "bg-rose-50"
    },
    {
      title: "Smart Medical Records",
      description: "Keep track of your medical history, allergies, and existing conditions in one secure, accessible dashboard.",
      icon: <ShieldCheck className="w-8 h-8 text-teal-600" />,
      color: "bg-teal-50"
    },
    {
      title: "Smart Search",
      description: "Easily find nearby doctors, specialized hospitals, and detailed information about common diseases.",
      icon: <Search className="w-8 h-8 text-violet-600" />,
      color: "bg-violet-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl opacity-60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-100 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
            <span className="text-primary-700 font-semibold text-sm">Predictive AI Healthcare</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
            Your Advanced <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-emerald-600 underline decoration-emerald-200 decoration-8 underline-offset-8">
              AI Health Companion
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-neutral-600 mb-12 leading-relaxed">
            CURALINK leverages state-of-the-art AI to provide personalized health analytics, instant symptom analysis, and wellness coaching—all focused on Indian lifestyles.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-primary-700 text-white rounded-xl font-bold text-lg hover:bg-primary-800 transition-all shadow-lg hover:shadow-primary-200/50 flex items-center group">
              Start Free Today
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white text-neutral-900 border border-neutral-300 rounded-xl font-bold text-lg hover:bg-neutral-50 transition-all">
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Core Intelligence</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to put your health in your hands with AI-driven precision.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard 
                key={idx}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                color={feature.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="py-20 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-900 rounded-[2.5rem] p-12 lg:p-20 text-white text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-emerald-900 opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black mb-8">Empowering 100% Free Access</h2>
              <p className="text-xl text-primary-100 mb-12 max-w-3xl mx-auto">
                No subscriptions. No hidden fees. We believe everyone deserves high-quality medical guidance powered by the latest AI advancements.
              </p>
              <div className="flex justify-center">
                <Link href="/signup" className="px-10 py-5 bg-white text-primary-900 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl">
                  Get Unlimited Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-black tracking-tight text-neutral-900 uppercase">CURALINK</span>
          </div>
          <p className="text-neutral-500 text-sm">
            © 2026 CURALINK Health. Empowering health with artificial intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
